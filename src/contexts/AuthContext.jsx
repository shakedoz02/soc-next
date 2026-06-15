import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

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

async function fetchAndMergeProfile(authUser) {
  const timeout = new Promise(resolve => setTimeout(() => resolve(null), 5000));
  const query = supabase
    .from('profiles')
    .select('name, xp, level, xp_to_next, rank, sessions_completed, accuracy')
    .eq('id', authUser.id)
    .single();

  const result = await Promise.race([query, timeout]);
  const profile = result?.data ?? null;

  if (!profile) return authUser;

  return {
    ...authUser,
    name:              profile.name,
    xp:                profile.xp,
    level:             profile.level,
    xpToNext:          profile.xp_to_next,
    rank:              profile.rank,
    sessionsCompleted: profile.sessions_completed,
    accuracy:          Number(profile.accuracy),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(await fetchAndMergeProfile(session.user));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        if (event === 'INITIAL_SESSION') {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: { message: authErrorMessage(error) } };
    return { error: null };
  };

  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name?.trim() || 'אנליסט חדש' } },
    });
    if (error) return { error: { message: authErrorMessage(error) } };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const saveInvestigation = async ({
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
      p_commands:       commands ?? [],
    });

    if (error) {
      console.error('saveInvestigation RPC error:', error);
      return { error };
    }

    // Sync local user state from the values the DB computed
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
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const merged = await fetchAndMergeProfile(user);
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, saveInvestigation, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
