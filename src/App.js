import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/userProvider";
import Register from "./components/register";
import Login from "./components/loginForm";
import ProtectedRoute from "./utils/protectedRoute";
import UserProfile from "./components/user/userProfile";
import VerifyUser from "./components/user/verifyUser";
import ForgotPassword from "./components/forgotPassword";
import ResetPassword from "./components/resetPassword";
import "./App.css";
import Subscription from "./components/user/subscription";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div>
          <Routes>
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
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
