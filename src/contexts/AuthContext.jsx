import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USER = {
  id: 'usr-01',
  email: 'analyst@soc-next.il',
  name: 'אנליסט 01',
  level: 4,
  xp: 3240,
  xpToNext: 5000,
  rank: 'Senior Analyst',
  sessionsCompleted: 18,
  accuracy: 91.4,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('soc_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    await new Promise(r => setTimeout(r, 800));
    if (email && password.length >= 6) {
      const u = { ...MOCK_USER, email };
      setUser(u);
      localStorage.setItem('soc_user', JSON.stringify(u));
      return { error: null };
    }
    return { error: { message: 'אימייל או סיסמה שגויים' } };
  };

  const signUp = async (email, password, name) => {
    await new Promise(r => setTimeout(r, 800));
    if (email && password.length >= 6) {
      const u = { ...MOCK_USER, email, name: name || 'אנליסט חדש', xp: 0, level: 1 };
      setUser(u);
      localStorage.setItem('soc_user', JSON.stringify(u));
      return { error: null };
    }
    return { error: { message: 'נא למלא את כל השדות' } };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('soc_user');
  };

  const addXP = (amount) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, xp: prev.xp + amount };
      localStorage.setItem('soc_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, addXP }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
