import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const LEVEL_THRESHOLDS = [0, 1000, 2500, 5000, 9000, 15000, 23000, 35000, 50000, 70000];

function computeLevel(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const xpToNext = level < LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[level]
    : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
  const rank =
    level >= 9 ? 'Elite Analyst' :
    level >= 7 ? 'Lead Analyst'  :
    level >= 5 ? 'Senior Analyst':
    level >= 3 ? 'Analyst'       : 'Junior Analyst';
  return { level, xpToNext, rank };
}

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
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, xp, level, xp_to_next, rank, sessions_completed, accuracy')
    .eq('id', authUser.id)
    .single();

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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(await fetchAndMergeProfile(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(await fetchAndMergeProfile(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
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

    // 1. Fetch current profile stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, sessions_completed, accuracy')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('saveInvestigation: fetch profile error:', profileError);
      return { error: profileError };
    }

    // 2. Compute new values (mirrors compute_level() and accuracy logic in schema)
    const newXp       = profile.xp + xpEarned;
    const newSessions = profile.sessions_completed + 1;
    const newAccuracy = Number(
      (((profile.accuracy * (newSessions - 1)) + score) / newSessions).toFixed(2)
    );
    const { level, xpToNext, rank } = computeLevel(newXp);

    // 3. Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp:                newXp,
        level,
        xp_to_next:        xpToNext,
        rank,
        sessions_completed: newSessions,
        accuracy:           newAccuracy,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('saveInvestigation: update profile error:', updateError);
      return { error: updateError };
    }

    // 4. Insert investigation record
    const { error: insertError } = await supabase
      .from('investigations')
      .insert({
        user_id:         user.id,
        scenario_id:     scenarioId,
        scenario_title:  scenarioTitle,
        score,
        xp_earned:       xpEarned,
        elapsed_seconds: elapsed,
        mistakes,
        commands,
      });

    if (insertError) {
      console.error('saveInvestigation: insert investigation error:', insertError);
      return { error: insertError };
    }

    // 5. Sync local user state so UI reflects new XP/level immediately
    setUser(prev => prev ? {
      ...prev,
      xp:                newXp,
      level,
      xpToNext,
      rank,
      sessionsCompleted: newSessions,
      accuracy:          newAccuracy,
    } : prev);

    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, saveInvestigation }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
