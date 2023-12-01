import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  FormHelperText,
} from "@chakra-ui/react";

function ResetPassword() {
  const { token } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password1", "");
  const [message, setMessage] = useState("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const BASE_API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (data.password1 !== data.password2) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_API_URL}/api/reset-password`, {
        token,
        password: data.password1,
      });
      setMessage("Your password has been successfully reset");
      setIsResetSuccessful(true);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || "Failed to reset password";
      setMessage(serverMessage);
    }
    setLoading(false);
  };

  const goto = (route) => {
    navigate(route);
  };

  return !isResetSuccessful ? (
    <>
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
                Reset your password
              </Heading>
              <Text color="fg.muted">Enter and confirm your new password</Text>
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
                    <FormLabel htmlFor="password1">Password *</FormLabel>
                    <Input
                      id="password1"
                      type="password"
                      placeholder="Password"
                      {...register("password1", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must have at least 8 characters",
                        },
                      })}
                    />
                    {errors.password1 && (
                      <div style={{ color: "red" }}>
                        {errors.password1.message}
                      </div>
                    )}
                    <FormHelperText color="fg.muted">
                      At least 8 characters long
                    </FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="password2">
                      Confirm password *
                    </FormLabel>
                    <Input
                      id="password2"
                      type="password"
                      placeholder="Confirm password"
                      {...register("password2", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    {errors.password2 && (
                      <div style={{ color: "red" }}>
                        {errors.password2.message}
                      </div>
                    )}
                  </FormControl>
                </Stack>
                <Stack spacing="6">
                  {message && <div style={{ color: "red" }}>{message}</div>}
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Resetting password ..." : "Reset password"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </>
  ) : (
    <>
      <Box as="section">
        <Container py={{ base: "16", md: "24" }}>
          <Stack spacing={{ base: "8", md: "10" }}>
            <Stack
              spacing={{ base: "4", md: "5" }}
              align="center"
            >
              <Heading size={{ base: "sm", md: "md" }}>
                Your password has been successfully reset
              </Heading>

              <Text
                color="fg.muted"
                maxW="2xl"
                textAlign="center"
                fontSize="xl"
              >
                You can now login and start creating beautiful images.
              </Text>
            </Stack>
            <Stack
              spacing="3"
              direction={{ base: "column", sm: "row" }}
              justify="center"
            >
              <Button
                size="xl"
                onClick={() => goto("/login")}
              >
                Click here to login
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

export default ResetPassword;
