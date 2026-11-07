import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUserDto, StaffRole } from '@libreriard/shared';
import { StaffAuthService } from '../services/staff-auth.service';

interface AuthContextType {
  user: StaffUserDto | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUserDto | null>(() => {
    const saved = localStorage.getItem('rd_staff_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const authService = new StaffAuthService();

  useEffect(() => {
    authService.refresh().then(res => {
      if (res.success) {
        authService.getProfile().then(p => {
          if (p.success && p.data) {
            setUser(p.data);
            localStorage.setItem('rd_staff_user', JSON.stringify(p.data));
          }
        });
      } else {
        setUser(null);
        localStorage.removeItem('rd_staff_user');
      }
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login({ email, password: pass });
    if (res.success && res.data) {
      const u = res.data.user as StaffUserDto;
      setUser(u);
      localStorage.setItem('rd_staff_user', JSON.stringify(u));
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Error al iniciar sesión' };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('rd_staff_user');
  };

  const isAdmin = user?.role === StaffRole.ADMIN;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
};
