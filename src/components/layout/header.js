import React, { useContext, useState } from "react";
import "./header.css";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/userProvider";
import Logout from "../user/logout";

const Header = () => {
  const { user } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setTimeout(() => {
        setIsTransitionComplete(true);
      }, 500); // Adjust the timeout to match your transition duration
    } else {
      setIsTransitionComplete(false);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <Link to="/">EasySetup</Link>
        </div>
        <nav className="header-nav">
          {user ? (
            <>
              <Link
                to="/user/profile"
                className="nav-link"
              >
                Profile
              </Link>
              <Logout />
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="nav-link"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="nav-link"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
        <div
          className={`menu-icon ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
      </header>
      <div className={`overlay ${isMenuOpen ? "open" : ""}`}>
        <div
          className={`overlay-content ${isTransitionComplete ? "visible" : ""}`}
        >
          {user ? (
            <>
              <Link
                to="/user/profile"
                onClick={toggleMenu}
                className="nav-link mobile-menu"
                tabIndex="-1" /* Prevents the link from being focusable */
              >
                Profile
              </Link>
              <Logout />
            </>
          ) : (
            <>
              <Link
                to="/register"
                onClick={toggleMenu}
                className="nav-link mobile-menu"
                tabIndex="-1"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                onClick={toggleMenu}
                className="nav-link mobile-menu"
                tabIndex="-1"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
