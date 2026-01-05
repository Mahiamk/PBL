import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const storeId = localStorage.getItem('storeId');
    const profileImage = localStorage.getItem('profileImage');
    const fullName = localStorage.getItem('fullName');
    const email = localStorage.getItem('email');

    if (token && role && userId) {
      setUser({ 
        token, 
        role, 
        userId: parseInt(userId), 
        storeId: storeId ? parseInt(storeId) : null,
        profileImage: profileImage === 'null' ? null : profileImage,
        fullName: fullName || '',
        email: email || ''
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.user_id);
      if (data.store_id) {
        localStorage.setItem('storeId', data.store_id);
      } else {
        localStorage.removeItem('storeId');
      }
      if (data.profile_image) {
         localStorage.setItem('profileImage', data.profile_image);
      } else {
         localStorage.removeItem('profileImage');
      }
      if (data.full_name) {
        localStorage.setItem('fullName', data.full_name);
      }
      if (data.email) {
        localStorage.setItem('email', data.email);
      }

      setUser({ 
        token: data.access_token, 
        role: data.role, 
        userId: data.user_id,
        storeId: data.store_id,
        profileImage: data.profile_image,
        fullName: data.full_name,
        email: data.email
      });
      return data;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('storeId');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
