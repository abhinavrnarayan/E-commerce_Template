import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; needsOTP?: boolean }>;
  verifyOTP: (otp: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  pendingUser: Partial<User> | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<Partial<User> | null>(null);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedPendingUser = localStorage.getItem('pendingUser');
    if (savedPendingUser) {
      setPendingUser(JSON.parse(savedPendingUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call - replace with Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for demo admin credentials first
      if (email === 'admin@ecommerce.com' && password === 'password123') {
        const adminUser: User = {
          id: 'admin-001',
          email: 'admin@ecommerce.com',
          name: 'Admin User',
          phone: '+91 98765 43210',
          isAdmin: true,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        setPendingUser(null);
        localStorage.removeItem('pendingUser');
        setLoading(false);
        return true;
      }
      
      // Check for demo regular user credentials
      if (email === 'user@demo.com' && password === 'password123') {
        const demoUser: User = {
          id: 'user-001',
          email: 'user@demo.com',
          name: 'Demo User',
          phone: '+91 98765 43211',
          isAdmin: false,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setPendingUser(null);
        localStorage.removeItem('pendingUser');
        setLoading(false);
        return true;
      }
      
      // Check if user exists in registered users database
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = existingUsers.find((u: User) => u.email === email);
      
      if (existingUser) {
        // For demo purposes, we're not validating password for registered users
        // In real implementation, you would validate password hash
        const userData: User = {
          ...existingUser,
          isAdmin: false // Regular registered users are not admin
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setPendingUser(null);
        localStorage.removeItem('pendingUser');
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, phone: string): Promise<{ success: boolean; needsOTP?: boolean }> => {
    setLoading(true);
    try {
      // Simulate API call - replace with Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.find((u: User) => u.email === email || u.phone === phone);
      
      if (userExists) {
        setLoading(false);
        return { success: false };
      }
      
      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        phone,
        isAdmin: false,
        isVerified: false,
        createdAt: new Date().toISOString()
      };
      
      // Store as pending user until OTP verification
      setPendingUser(userData);
      localStorage.setItem('pendingUser', JSON.stringify(userData));
      
      setLoading(false);
      return { success: true, needsOTP: true };
    } catch (error) {
      setLoading(false);
      return { success: false };
    }
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate OTP verification - replace with actual SMS service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, accept any 6-digit OTP
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        if (pendingUser) {
          const verifiedUser: User = {
            ...pendingUser as User,
            isVerified: true
          };
          
          // Save to registered users
          const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          existingUsers.push(verifiedUser);
          localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
          
          setUser(verifiedUser);
          localStorage.setItem('user', JSON.stringify(verifiedUser));
          setPendingUser(null);
          localStorage.removeItem('pendingUser');
          
          setLoading(false);
          return true;
        }
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const resendOTP = async (): Promise<boolean> => {
    try {
      // Simulate resending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        
        // Update in registered users
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedUsers = existingUsers.map((u: User) => 
          u.id === user.id ? updatedUser : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
  };

  const value = {
    user,
    login,
    register,
    verifyOTP,
    updateProfile,
    resendOTP,
    logout,
    loading,
    pendingUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};