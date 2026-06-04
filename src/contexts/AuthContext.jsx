import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function rowToUser(p) {
  return {
    id:                p.id,
    email:             p.email,
    name:              p.name,
    level:             p.level,
    xp:                p.xp,
    xpToNext:          p.xp_to_next,
    rank:              p.rank,
    sessionsCompleted: p.sessions_completed,
    accuracy:          Number(p.accuracy),
  };
}

// Translate Supabase auth errors into clear, user-facing Hebrew messages.
// Keyed on error.code (stable) first, then falling back to message text, so a
// real backend/config problem is surfaced instead of being masked.
function authErrorMessage(error) {
  const code = error?.code;
  const msg = (error?.message || '').toLowerCase();

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'אימייל או סיסמה שגויים';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'החשבון עדיין לא אומת. בדוק את המייל ולחץ על קישור האישור.';
  }
  if (msg.includes('email logins are disabled') || code === 'email_provider_disabled') {
    return 'התחברות עם אימייל וסיסמה כבויה בהגדרות Supabase.';
  }
  if (code === 'signup_disabled' || msg.includes('signups not allowed')) {
    return 'הרשמת משתמשים חדשים מושבתת כרגע.';
  }
  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return 'כתובת אימייל זו כבר רשומה. נסה להתחבר.';
  }
  if (code === 'weak_password' || msg.includes('password should be')) {
    return 'הסיסמה חלשה מדי — נדרשים לפחות 6 תווים.';
  }
  if (code?.includes('rate_limit') || msg.includes('rate limit') || error?.status === 429) {
    return 'יותר מדי ניסיונות. המתן רגע ונסה שוב.';
  }
  return error?.message || 'אירעה שגיאה. נסה שוב.';
}

async function fetchProfile(userId, { retries = 5, delayMs = 300 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) return rowToUser(data);
    if (attempt < retries) await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    // Keep in sync on login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setUser(profile);
          } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            // Profile trigger hasn't landed yet — set a minimal stub so the
            // AuthPage useEffect can navigate to /lobby. The full profile loads
            // the next time the user visits or on the next auth state change.
            setUser({
              id:                session.user.id,
              email:             session.user.email,
              name:              session.user.user_metadata?.name || 'אנליסט חדש',
              level:             1,
              xp:                0,
              xpToNext:          1000,
              rank:              'Junior Analyst',
              sessionsCompleted: 0,
              accuracy:          0,
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: { message: authErrorMessage(error) } };
    return { error: null };
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name?.trim() || 'אנליסט חדש' },
      },
    });
    console.log('[signUp] error:', error);
    console.log('[signUp] data.user:', data?.user);
    console.log('[signUp] data.session:', data?.session);
    console.log('[signUp] identities:', data?.user?.identities);
    if (error) return { error: { message: authErrorMessage(error) } };

    // Supabase hides "email already registered" by returning a user with an
    // empty identities array and no error. Surface it instead of silently
    // showing a success/confirmation screen.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: { message: 'כתובת אימייל זו כבר רשומה. נסה להתחבר.' } };
    }

    if (!data?.session) {
      return { error: null, needsConfirmation: true };
    }

    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || 'אנליסט חדש',
    });

    return { error: null, needsConfirmation: false };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Called after an investigation completes.
  // Delegates XP calc + DB write to the secure RPC function.
  const saveInvestigation = useCallback(async ({
    scenarioId, scenarioTitle, score, xpEarned, elapsed, mistakes, commands,
  }) => {
    if (!user) return { error: { message: 'לא מחובר' } };

    const { data, error } = await supabase.rpc('add_xp_and_save_investigation', {
      p_user_id:        user.id,
      p_xp_to_add:      xpEarned,
      p_scenario_id:    scenarioId,
      p_scenario_title: scenarioTitle,
      p_score:          score,
      p_elapsed:        elapsed,
      p_mistakes:       mistakes,
      p_commands:       JSON.stringify(commands),
    });

    if (error) {
      console.error('saveInvestigation RPC error:', error);
      return { error };
    }

    // Optimistically update local user state from RPC response
    setUser(prev => prev ? {
      ...prev,
      xp:                data.xp,
      level:             data.level,
      xpToNext:          data.xp_to_next,
      rank:              data.rank,
      sessionsCompleted: data.sessions_completed,
      accuracy:          Number(data.accuracy),
    } : prev);

    return { error: null };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, saveInvestigation }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
