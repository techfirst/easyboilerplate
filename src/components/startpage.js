import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/userProvider";
import {
  Box,
  Button,
  Container,
  Heading,
  Img,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Features } from "./features";
import EasySetupImage from "../assets/images/robot.png";
// import StripePriceTable from "./stripepricetable";

const StartPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate("/register");
  };

  return (
    <>
      <Box
        position="relative"
        height={{ lg: "720px" }}
      >
        <Container
          py={{ base: "16", md: "24" }}
          height="full"
        >
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={{ base: "16" }}
            align={{ lg: "center" }}
            height="full"
          >
            <Stack spacing={{ base: "8", md: "12" }}>
              <Stack spacing="4">
                <Stack
                  spacing={{ base: "4", md: "6" }}
                  maxW={{ md: "xl", lg: "md", xl: "xl" }}
                >
                  <Heading size={{ base: "md", md: "lg" }}>
                    Welcome to your new project
                  </Heading>
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    color="fg.muted"
                  >
                    Let's get started - The magic you are looking for is in the
                    work you are avoiding
                  </Text>
                </Stack>
              </Stack>
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing="3"
              >
                {!user && (
                  <Button
                    size={{ base: "lg", md: "xl" }}
                    onClick={handleGetStartedClick}
                  >
                    Get started
                  </Button>
                )}

                {/* <Button
                  variant="secondary"
                  size={{ base: "lg", md: "xl" }}
                >
                  Learn more
                </Button> */}
              </Stack>
            </Stack>
            <Box
              pos={{ lg: "absolute" }}
              right="0"
              bottom="0"
              w={{ base: "full", lg: "50%" }}
              height={{ base: "96", lg: "full" }}
              sx={{
                clipPath: { lg: "polygon(7% 0%, 100% 0%, 100% 100%, 0% 100%)" },
              }}
            >
              <Img
                boxSize="full"
                objectFit="cover"
                src={EasySetupImage}
                alt="EasySetup"
              />
            </Box>
          </Stack>
        </Container>
      </Box>
      <Features />
      {/* <StripePriceTable /> */}
    </>
  );
};

export default StartPage;
