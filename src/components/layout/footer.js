import React from "react";
import {
  ButtonGroup,
  Container,
  IconButton,
  Stack,
  Text,
  Image,
  Box,
} from "@chakra-ui/react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import Logo from "../../assets/images/easysetup.png";

export const Footer = (props) => {
  return (
    <Box bg="bg.surface">
      <Container
        as="footer"
        role="contentinfo"
        py={{ base: "12", md: "16" }}
      >
        <Stack spacing={{ base: "4", md: "5" }}>
          <Stack
            justify="space-between"
            direction="row"
            align="center"
          >
            <Image
              src={Logo}
              alt="EasySetup"
              style={{ maxHeight: "40px" }}
            />
            <ButtonGroup variant="tertiary">
              <IconButton
                as="a"
                href="#"
                aria-label="LinkedIn"
                icon={<FaLinkedin />}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="GitHub"
                icon={<FaGithub />}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="Twitter"
                icon={<FaTwitter />}
              />
            </ButtonGroup>
          </Stack>
          <Text
            fontSize="sm"
            color="fg.subtle"
          >
            &copy; {new Date().getFullYear()} Technology First Sweden AB. All
            rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
