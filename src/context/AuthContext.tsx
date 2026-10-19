import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, EducationalSystem, EducationalStage } from '../types';
import { storage, DEFAULT_USER } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    system: EducationalSystem;
    stage: EducationalStage;
    grade: string;
    dailyGoalMinutes?: number;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccount: () => void;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    storage.init();
    return storage.getUser();
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('zakerly_theme') as 'light' | 'dark';
    if (saved) return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('zakerly_theme', theme);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (email: string, _pass: string): Promise<boolean> => {
    // In local persistent mode, fetch current or create session
    let existing = storage.getUser();
    if (!existing || existing.email !== email) {
      existing = {
        ...DEFAULT_USER,
        id: 'usr_' + Date.now(),
        email,
        name: email.split('@')[0],
      };
    }
    storage.setUser(existing);
    setUser(existing);
    return true;
  };

  const loginAsDemo = () => {
    storage.setUser(DEFAULT_USER);
    setUser(DEFAULT_USER);
  };

  const signup = async (data: {
    name: string;
    email: string;
    system: EducationalSystem;
    stage: EducationalStage;
    grade: string;
    dailyGoalMinutes?: number;
  }): Promise<boolean> => {
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      system: data.system,
      stage: data.stage,
      grade: data.grade,
      dailyGoalMinutes: data.dailyGoalMinutes || 120,
      weeklyGoalHours: Math.round((data.dailyGoalMinutes || 120) * 6 / 60),
      theme,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    };
    storage.setUser(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    storage.setUser(null);
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    storage.setUser(updated);
    setUser(updated);
  };

  const deleteAccount = () => {
    storage.resetToDefault();
    storage.setUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        theme,
        setTheme,
        toggleTheme,
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
