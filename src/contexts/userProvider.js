import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    refreshUserToken();
  }, []);

  async function refreshUserToken() {
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(
        `${apiUrl}/api/user/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("UserProvider: Error refreshing token:", error);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <UserContext.Provider value={{ user, isChecking, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
