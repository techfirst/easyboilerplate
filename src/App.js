import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { UserProvider } from "./contexts/userProvider";
import Register from "./components/Register";
import Login from "./components/loginForm";
import ProtectedRoute from "./utils/ProtectedRoute";
import UserProfile from "./components/user/userProfile";
import VerifyUser from "./components/user/verifyUser";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div>
          <Switch>
            <Route
              exact
              path="/register"
              component={Register}
            />
            <Route
              exact
              path="/login"
              component={Login}
            />
            <Route
              exact
              path="/verify-user/:token"
              component={VerifyUser}
            />
            <ProtectedRoute
              exact
              path="/user/profile"
              component={UserProfile}
            />
          </Switch>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
