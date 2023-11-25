import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/userProvider";
import Register from "./components/register";
import Login from "./components/loginForm";
import ProtectedRoute from "./utils/protectedRoute";
import UserProfile from "./components/user/userProfile";
import VerifyUser from "./components/user/verifyUser";
import "./App.css";

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
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
