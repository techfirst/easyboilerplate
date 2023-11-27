import React, { useContext } from "react";
import { UserContext } from "../../contexts/userProvider";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const BASE_API_URL = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      // Invalidate the session on the server
      await axios.post(
        `${BASE_API_URL}/api/user/logout`,
        {},
        { withCredentials: true }
      );

      // Clear user context and any stored tokens
      setUser(null);

      // Redirect to login or home page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Link
      onClick={handleLogout}
      className="nav-link"
    >
      Logout
    </Link>
  );
};

export default Logout;
