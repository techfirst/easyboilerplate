import React, { useContext } from "react";
import { UserContext } from "../../contexts/userProvider";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  HStack,
  Image,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { MobileDrawer } from "./MobileNavBar";
import { ToggleButton } from "./ToggleButton";
import Logo from "../../assets/images/easysetup.png";
import { useNavbar } from "./useNavbar";
import axios from "axios";

export const Header = () => {
  const { setUser } = useContext(UserContext);
  const { rootProps } = useNavbar();
  const { user } = useContext(UserContext);
  const isDesktop = useBreakpointValue({
    base: false,
    lg: true,
  });
  const mobileNavbar = useDisclosure();
  const navigate = useNavigate();

  const goto = (route) => {
    navigate(route);
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
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Box
      borderBottomWidth="1px"
      bg="bg.surface"
      position="sticky"
      top="0"
      zIndex="docked"
      {...rootProps}
    >
      <Container py="4">
        <HStack justify="space-between">
          <Link to={"/"}>
            <Image
              src={Logo}
              alt="EasySetup"
              style={{ maxHeight: "40px" }}
            />
          </Link>
          {isDesktop ? (
            <HStack spacing="8">
              <ButtonGroup
                size="lg"
                variant="text"
                spacing="8"
              >
                <Button onClick={() => goto("/")}>Start</Button>
                {user ? (
                  <>
                    <Button onClick={() => goto("/user/subscription")}>
                      Subscription
                    </Button>
                    <Button onClick={() => goto("/user/profile")}>
                      Profile
                    </Button>
                    <Button onClick={logout}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => goto("/login")}>Login</Button>
                  </>
                )}
              </ButtonGroup>
              {!user && (
                <Button
                  size={{ base: "lg", md: "xl" }}
                  onClick={() => goto("/register")}
                >
                  Register
                </Button>
              )}
            </HStack>
          ) : (
            <>
              <ToggleButton
                onClick={mobileNavbar.onToggle}
                isOpen={mobileNavbar.isOpen}
                aria-label="Open Menu"
              />
              <MobileDrawer
                isOpen={mobileNavbar.isOpen}
                onClose={mobileNavbar.onClose}
                closeDrawer={mobileNavbar.onClose}
              />
            </>
          )}
        </HStack>
      </Container>
    </Box>
  );
};

export default Header;
