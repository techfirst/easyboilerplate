import React, { useContext } from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/userProvider";
import Logout from "../user/logout";

const Header = () => {
  const { user } = useContext(UserContext);

  return (
    <header className="header">
      <div className="header-brand">
        <Link to="/">EasySetup</Link>
      </div>
      <nav className="header-nav">
        {user && (
          <>
            <Link
              to="/user/profile"
              className="nav-link"
            >
              Profile
            </Link>
            <Logout />
          </>
        )}

        {!user && (
          <Link
            to="/register"
            className="nav-link"
          >
            Sign up
          </Link>
        )}

        {!user && (
          <Link
            to="/login"
            className="nav-link"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
