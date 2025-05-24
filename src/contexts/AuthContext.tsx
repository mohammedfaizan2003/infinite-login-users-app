
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, department: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock credentials
const MOCK_CREDENTIALS = {
  email: 'admin@company.com',
  password: 'password123',
  department: 'Engineering'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, department: string): boolean => {
    if (
      email === MOCK_CREDENTIALS.email &&
      password === MOCK_CREDENTIALS.password &&
      department === MOCK_CREDENTIALS.department
    ) {
      setUser({ email, department });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
