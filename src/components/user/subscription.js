import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../contexts/userProvider";
import { Link } from "react-router-dom";
import StripePriceTable from "../stripepricetable";
import {
  Box,
  Button,
  Container,
  Heading,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import StripeLogo from "../../assets/images/stripe.png";
const Subscription = () => {
  const { user } = useContext(UserContext);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/check-subscription`,
          {
            withCredentials: true,
          }
        );
        setHasActiveSubscription(response.data.hasActiveSubscription);
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setError(
          "Failed to check subscription status. Please try again later."
        );
      }
      setIsLoading(false);
    };

    if (user.email) {
      checkSubscriptionStatus();
    }
  }, [user.email]);

  const gotoPortal = () => {
    window.open(process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL_LINK, "_blank");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/getuser`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const userData = response.data.user;
          const today = new Date();
          let showButton = false;

          if (
            userData.subscription_start_date &&
            userData.subscription_end_date
          ) {
            const startDate = new Date(userData.subscription_start_date);
            const endDate = new Date(userData.subscription_end_date);

            // Check if today's date is between start and end dates
            if (startDate <= today && today <= endDate) {
              showButton = true;
            }
          }

          setShowBuyButton(showButton);
          setUserId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const gotoBuyCredits = () => {
    window.open(
      process.env.REACT_APP_STRIPE_BUY_CREDITS_LINK +
        "?client_reference_id=" +
        userId,
      "_blank"
    );
  };

  return (
    <Box as="section">
      <Container py={{ base: "16", md: "24" }}>
        <Stack spacing={{ base: "8", md: "10" }}>
          <Stack
            spacing={{ base: "4", md: "5" }}
            align="center"
          >
            {isLoading ? (
              <>
                <Heading size={{ base: "sm", md: "md" }}>
                  Loading subscription status ...
                </Heading>
              </>
            ) : hasActiveSubscription ? (
              <>
                <Heading size={{ base: "sm", md: "md" }}>
                  You already have an active subscription
                </Heading>
              </>
            ) : (
              <>
                <Heading size={{ base: "sm", md: "md" }}>
                  Our different subscriptions
                </Heading>
              </>
            )}

            {!isLoading && error ? (
              <>
                <Text
                  color="fg.muted"
                  maxW="2xl"
                  textAlign="center"
                  fontSize="xl"
                >
                  {error}
                </Text>
              </>
            ) : hasActiveSubscription ? (
              <>
                <Text
                  color="fg.muted"
                  maxW="2xl"
                  textAlign="center"
                  fontSize="xl"
                >
                  Here you can manage your current subscription by visting our
                  payment partner <b>Stripe</b> and their <b>Customer Portal</b>
                  {showBuyButton && (
                    <>
                      <br />
                      <br />
                      Be sure to use the same e-mail address ({user.email}) in
                      the checkout when you buy credits as you have registered
                      here on EasyImageAI.com
                    </>
                  )}
                </Text>
              </>
            ) : (
              <>
                <Text
                  color="fg.muted"
                  maxW="2xl"
                  textAlign="center"
                  fontSize="xl"
                >
                  Choose the one best suited for your needs and get started
                  creating.
                </Text>
              </>
            )}
          </Stack>
          {!isLoading &&
            (hasActiveSubscription ? (
              <>
                <Stack
                  spacing="3"
                  direction={{ base: "column", sm: "row" }}
                  justify="center"
                >
                  <Button
                    size="xl"
                    onClick={gotoPortal}
                  >
                    Stripe Customer Portal
                  </Button>
                  {showBuyButton && (
                    <>
                      <Button
                        size="xl"
                        onClick={gotoBuyCredits}
                      >
                        Buy credits
                      </Button>
                    </>
                  )}
                </Stack>
                <Stack
                  spacing="3"
                  direction={{ base: "column", sm: "row" }}
                  justify="center"
                >
                  <Link
                    to="https://stripe.com"
                    target="_blank"
                  >
                    <Image
                      style={{ maxWidth: "120px" }}
                      src={StripeLogo}
                      alt="Powered by Stripe"
                    />
                  </Link>
                </Stack>
              </>
            ) : (
              <StripePriceTable />
            ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default Subscription;
