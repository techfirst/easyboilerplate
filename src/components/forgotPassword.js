import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
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
} from "@chakra-ui/react";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const BASE_API_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(`${BASE_API_URL}/api/forgot-password`, data);
      setMessage(
        "If an account with that e-mail exists, a password reset link has been sent. Click that to reset your password."
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error occurred while sending reset link.";
      setMessage(errorMessage);
    }
    setLoading(false);
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
              Reset your password
            </Heading>
            <Text color="fg.muted">
              Enter your e-mail address to reset your password
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
              </Stack>

              <Stack spacing="6">
                {message && <div>{message}</div>}
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

    // <div className="container">
    //   <div className="form-container">
    //     <form
    //       className="form-box"
    //       onSubmit={handleSubmit(onSubmit)}
    //     >
    //       <div className="form-input-group">
    //         <input
    //           type="email"
    //           {...register("email", {
    //             required: "E-mail is required",
    //             pattern: {
    //               value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
    //               message: "Invalid email format",
    //             },
    //           })}
    //           className="form-input"
    //           placeholder="Enter your e-mail"
    //         />
    //         {errors.email && (
    //           <div className="error-message">{errors.email.message}</div>
    //         )}
    //       </div>
    //       <button
    //         className="form-button"
    //         type="submit"
    //       >
    //         Reset Password
    //       </button>
    //       {message && <div className="message">{message}</div>}
    //     </form>
    //   </div>
    // </div>
  );
}

export default ForgotPassword;
