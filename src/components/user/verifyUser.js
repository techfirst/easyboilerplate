import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";

const VerifyUser = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    error: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/verify-user?token=${token}`
        );
        if (response.status === 200) {
          setVerificationStatus({
            loading: false,
            success: true,
            error: false,
          });
        } else {
          setVerificationStatus({
            loading: false,
            success: false,
            error: true,
          });
        }
      } catch (error) {
        setVerificationStatus({ loading: false, success: false, error: true });
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  const goto = (route) => {
    navigate(route);
  };

  return (
    <Box as="section">
      <Container py={{ base: "16", md: "24" }}>
        <Stack spacing={{ base: "8", md: "10" }}>
          <Stack
            spacing={{ base: "4", md: "5" }}
            align="center"
          >
            {verificationStatus.loading && (
              <Heading size={{ base: "sm", md: "md" }}>Verifying...</Heading>
            )}

            {verificationStatus.success && (
              <Heading size={{ base: "sm", md: "md" }}>
                Your account has been successfully verified
              </Heading>
            )}

            <Text
              color="fg.muted"
              maxW="2xl"
              textAlign="center"
              fontSize="xl"
            >
              {verificationStatus.success && (
                <>You can now login and start creating beautiful images.</>
              )}

              {verificationStatus.error && (
                <>
                  Verification failed. Please try again or contact support for
                  help.
                </>
              )}
            </Text>
          </Stack>
          {verificationStatus.success && (
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
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default VerifyUser;
