import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/userProvider";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Text,
  IconButton,
  InputGroup,
  InputRightElement,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { isOpen, onToggle } = useDisclosure();
  const inputRef = useRef(null);
  const onClickReveal = () => {
    onToggle();
    if (inputRef.current) {
      inputRef.current.focus({
        preventScroll: true,
      });
    }
  };
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError("");

    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${apiUrl}/api/login`, data, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUser(response.data.user);
        navigate("/user/profile");
      } else {
        setLoginError("Login failed. Please try again."); // Setting custom error message
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "Login error occurred.");
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  const goto = (route) => {
    navigate(route);
  };

  return (
    <Container
      maxW="lg"
      py={{
        base: "12",
        md: "24",
      }}
      px={{
        base: "0",
        sm: "8",
      }}
    >
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack
            spacing={{
              base: "2",
              md: "3",
            }}
            textAlign="center"
          >
            <Heading
              size={{
                base: "xs",
                md: "sm",
              }}
            >
              Login to your account
            </Heading>
            <Text color="fg.muted">
              Don't have an account?{" "}
              <Link onClick={() => goto("/register")}>Sign up</Link>
            </Text>
          </Stack>
        </Stack>
        <Box
          py={{
            base: "0",
            sm: "8",
          }}
          px={{
            base: "4",
            sm: "10",
          }}
          bg={{
            base: "transparent",
            sm: "bg.surface",
          }}
          boxShadow={{
            base: "none",
            sm: "md",
          }}
          borderRadius={{
            base: "none",
            sm: "xl",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="email">E-mail</FormLabel>
                  <Input
                    id="email"
                    size="md"
                    {...register("email", {
                      required: "E-mail is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                        message: "Invalid e-mail format",
                      },
                    })}
                  />
                  <div style={{ color: "red" }}>
                    {errors.email && errors.email.message}
                  </div>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <InputRightElement>
                      <IconButton
                        variant="text"
                        aria-label={
                          isOpen ? "Mask password" : "Reveal password"
                        }
                        icon={isOpen ? <HiEyeOff /> : <HiEye />}
                        onClick={onClickReveal}
                      />
                    </InputRightElement>
                    <Input
                      id="password"
                      name="password"
                      type={isOpen ? "text" : "password"}
                      autoComplete="current-password"
                      size="md"
                      {...register("password", {
                        required: "Password is required",
                      })}
                    />
                  </InputGroup>
                  <div style={{ color: "red" }}>
                    {errors.password && errors.password.message}
                  </div>
                </FormControl>
              </Stack>
              <HStack justify="space-between">
                <Checkbox defaultChecked>Remember me</Checkbox>
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => goto("/forgot-password")}
                >
                  Forgot password?
                </Button>
              </HStack>
              <Stack spacing="6">
                {loginError && <div style={{ color: "red" }}>{loginError}</div>}
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
                {/* <HStack>
                  <Divider />
                  <Text
                    textStyle="sm"
                    whiteSpace="nowrap"
                    color="fg.muted"
                  >
                    or continue with
                  </Text>
                  <Divider />
                </HStack> */}
                {/* <OAuthButtonGroup /> */}
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default LoginForm;
