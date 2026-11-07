import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUserDto, CustomerRegisterRequestDto } from '@libreriard/shared';
import { CustomerAuthService } from '../services/customer-auth.service';

interface AuthContextType {
  user: CustomerUserDto | null;
  loading: boolean;
  isWholesale: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (dto: CustomerRegisterRequestDto) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUserDto | null>(() => {
    const saved = localStorage.getItem('rd_customer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const authService = new CustomerAuthService();

  const reloadUser = async () => {
    const res = await authService.refresh();
    if (!res.success) {
      setUser(null);
      localStorage.removeItem('rd_customer_user');
    }
  };

  useEffect(() => {
    reloadUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login({ email, password: pass });
    if (res.success && res.data) {
      const u = res.data.user as CustomerUserDto;
      setUser(u);
      localStorage.setItem('rd_customer_user', JSON.stringify(u));
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Error al iniciar sesión' };
  };

  const register = async (dto: CustomerRegisterRequestDto) => {
    const res = await authService.register(dto);
    return { success: res.success, message: res.message };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('rd_customer_user');
  };

  const isWholesale = Boolean(user?.isWholesaleApproved);

  return (
    <AuthContext.Provider value={{ user, loading, isWholesale, login, register, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

