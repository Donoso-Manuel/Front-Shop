import { createContext, useContext, useState, useEffect } from "react";
import Cookies from 'js-cookie';
import axios from "../config/axios"; // o la forma en que estés manejando tus peticiones

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Comprobar si el usuario está autenticado al cargar la aplicación
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/auth/verify"); // Endpoint que te devuelva el estado de autenticación
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      setIsAuthenticated(true);
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    Cookies.remove('userToken')
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, setIsAuthenticated, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
