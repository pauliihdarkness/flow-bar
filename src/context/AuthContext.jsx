import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Buscar datos adicionales en Firestore (rol, barId)
            const userDoc = await getDocFromServer(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUserData(userDoc.data());
            } else {
              setUserData(null);
            }

            setUser(firebaseUser);
          } else {
            setUser(null);
            setUserData(null);
          }
        } catch (error) {
          console.warn('No se pudieron cargar los datos del usuario desde Firestore:', error?.message || error);
          setUser(firebaseUser || null);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Error en estado de autenticacion:', error?.message || error);
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
    isBarman: userData?.role === 'barman',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
