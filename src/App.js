import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/loginForm";
import ProtectedRoute from "./utils/protectedRoute";
import UserProfile from "./components/user/userProfile";
import VerifyUser from "./components/user/verifyUser";
import ForgotPassword from "./components/forgotPassword";
import ResetPassword from "./components/resetPassword";
import "./App.css";
import Subscription from "./components/user/subscription";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import StartPage from "./components/startpage";

const App = () => {
  return (
    <Router>
      <Header /> {/* Header is always displayed */}
      <main>
        <Routes>
          <Route
            path="/"
            element={<StartPage />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />
          <Route
            path="/verify-user/:token"
            element={<VerifyUser />}
          />
          <Route
            path="/user/profile"
            element={<ProtectedRoute />}
          >
            <Route
              index
              element={<UserProfile />}
            />
          </Route>
          <Route
            path="/user/subscription"
            element={<ProtectedRoute />}
          >
            <Route
              index
              element={<Subscription />}
            />
          </Route>
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
