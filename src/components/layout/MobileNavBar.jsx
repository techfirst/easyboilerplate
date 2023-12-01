import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  Stack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useContext } from "react";
import { UserContext } from "../../contexts/userProvider";
import axios from "axios";

export const MobileDrawer = ({ closeDrawer, ...props }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { setUser } = useContext(UserContext);
  const goto = (route) => {
    navigate(route);
    closeDrawer();
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/logout`,
        {},
        { withCredentials: true }
      );

      setUser(null);
      navigate("/login");
      closeDrawer(); // Close the drawer after logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Drawer
      placement="right"
      {...props}
    >
      <DrawerContent>
        <DrawerBody mt="16">
          <Stack
            spacing="6"
            align="stretch"
          >
            <Button
              size="lg"
              variant="text"
              colorScheme="gray"
              onClick={() => goto("/")}
            >
              Start
            </Button>

            {user ? (
              <>
                <Button
                  size="lg"
                  variant="text"
                  onClick={() => goto("/user/subscription")}
                >
                  Subscription
                </Button>
                <Button
                  size="lg"
                  variant="text"
                  onClick={() => goto("/user/profile")}
                >
                  Profile
                </Button>
                <Button
                  size="lg"
                  variant="text"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="text"
                  onClick={() => goto("/login")}
                >
                  Login
                </Button>
                <Button onClick={() => goto("/register")}>Register</Button>
              </>
            )}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
