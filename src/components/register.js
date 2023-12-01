import React, { useState } from "react";
import {
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  Box,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import axios from "axios";

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password1", "");

  const onSubmit = async (data) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify(data);
      const res = await axios.post(`${apiUrl}/api/register`, body, config);

      if (res.status === 200) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error(err.response.data);
    }
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
        <Stack
          spacing="6"
          align="center"
        >
          <Stack
            spacing="3"
            textAlign="center"
          >
            {emailSent ? (
              <>
                <Heading
                  size={{
                    base: "xs",
                    md: "sm",
                  }}
                >
                  Thank you for registering!
                </Heading>
                <Text color="fg.muted">
                  Please check your e-mail and click the link to verify your
                  account and start using our service!
                </Text>
              </>
            ) : (
              <>
                <Heading
                  size={{
                    base: "xs",
                    md: "sm",
                  }}
                >
                  Create an account
                </Heading>
                <Text color="fg.muted">
                  Already have an account? <Link href="/login">Login</Link>
                </Text>
              </>
            )}
          </Stack>
        </Stack>
        {!emailSent && (
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
                    <FormLabel htmlFor="firstname">First name *</FormLabel>
                    <Input
                      id="firstname"
                      placeholder="First name"
                      type="text"
                      {...register("firstname", {
                        required: "First name is required",
                      })}
                    />
                    {errors.firstname && (
                      <div style={{ color: "red" }}>
                        {errors.firstname.message}
                      </div>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="lastname">Last name *</FormLabel>
                    <Input
                      id="lastname"
                      placeholder="Last name"
                      type="text"
                      {...register("lastname", {
                        required: "Last name is required",
                      })}
                    />
                    {errors.lastname && (
                      <div style={{ color: "red" }}>
                        {errors.lastname.message}
                      </div>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="companyName">Company name</FormLabel>
                    <Input
                      id="companyName"
                      placeholder="Company name"
                      type="text"
                      {...register("companyName")}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="email">E-mail *</FormLabel>
                    <Input
                      type="email"
                      placeholder="E-mail"
                      {...register("email", {
                        required: "E-mail is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: "Invalid e-mail address",
                        },
                      })}
                    />
                    {errors.email && (
                      <div style={{ color: "red" }}>{errors.email.message}</div>
                    )}
                  </FormControl>
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
                  <Button type="submit">Create account</Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default Register;
