import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const response = await axios.get(`${apiUrl}/user/getuser`, {
        withCredentials: true,
      });
      const result = response.data;
      if (result.success) {
        setUser(result.userData);
      }
    } catch (error) {
      console.error("Authentication check error:", error);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isChecking,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
