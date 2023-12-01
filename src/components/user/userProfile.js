import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
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

const UserProfile = () => {
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/getuser`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const userData = response.data.user;

          setValue("firstname", userData.firstname);
          setValue("lastname", userData.lastname);
          setValue("companyName", userData.company_name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/update`,
        data,
        { withCredentials: true }
      );
      setResponseMessage(response.data.message);
      setUpdateSuccess(true);
    } catch (error) {
      console.error("Update Error:", error);
      setResponseMessage(error.response?.data?.message || "Update failed");
      setUpdateSuccess(false);
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
            {updateSuccess ? (
              <>
                <Heading
                  size={{
                    base: "xs",
                    md: "sm",
                  }}
                >
                  Your profile is updated
                </Heading>
                <Text color="fg.muted">{responseMessage}</Text>
              </>
            ) : (
              <>
                <Heading
                  size={{
                    base: "xs",
                    md: "sm",
                  }}
                >
                  Your profile
                </Heading>
                <Text color="fg.muted">
                  You can update your information below
                </Text>
              </>
            )}
          </Stack>
        </Stack>
        {!updateSuccess && (
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
                </Stack>
                <Stack spacing="6">
                  <Button type="submit">Save</Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        )}
      </Stack>
    </Container>

    // <div className="container">
    //   <div className="form-container">
    //     {updateSuccess ? (
    //       <div className="form-box">
    //         <p>{responseMessage}</p>
    //       </div>
    //     ) : (
    //       <form
    //         className="form-box"
    //         onSubmit={handleSubmit(onSubmit)}
    //       >
    //         <input
    //           className="form-input"
    //           type="text"
    //           placeholder="First Name"
    //           {...register("firstname", { required: "First name is required" })}
    //         />
    //         {errors.firstname && (
    //           <p className="error-message">{errors.firstname.message}</p>
    //         )}

    //         <input
    //           className="form-input"
    //           type="text"
    //           placeholder="Last Name"
    //           {...register("lastname", { required: "Last name is required" })}
    //         />
    //         {errors.lastname && (
    //           <p className="error-message">{errors.lastname.message}</p>
    //         )}

    //         <input
    //           className="form-input"
    //           type="text"
    //           placeholder="Company Name"
    //           {...register("companyName")}
    //         />

    //         <button
    //           type="submit"
    //           className="form-button"
    //         >
    //           Save
    //         </button>
    //       </form>
    //     )}
    //   </div>
    // </div>
  );
};

export default UserProfile;
