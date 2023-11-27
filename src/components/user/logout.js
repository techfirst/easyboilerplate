import React, { useContext } from "react";
import { UserContext } from "../../contexts/userProvider";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const BASE_API_URL = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_API_URL}/api/user/logout`,
        {},
        { withCredentials: true }
      );

      setUser(null);

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
      Logout&nbsp;&nbsp;
      <FontAwesomeIcon icon={faSignOutAlt} />
    </Link>
  );
};

export default Logout;
