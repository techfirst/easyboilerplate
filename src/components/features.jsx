import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";

export const Features = () => (
  <Box
    as="section"
    bg="bg.surface"
  >
    <Container
      py={{
        base: "16",
        md: "24",
      }}
    >
      <Stack
        spacing={{
          base: "12",
          md: "16",
        }}
      >
        <Stack
          spacing={{
            base: "4",
            md: "5",
          }}
          maxW="3xl"
        >
          <Stack spacing="3">
            <Text
              fontSize={{
                base: "sm",
                md: "md",
              }}
              fontWeight="semibold"
              color="accent"
            >
              Features
            </Text>
            <Heading
              size={{
                base: "sm",
                md: "md",
              }}
            >
              What can you expect?
            </Heading>
          </Stack>
          <Text
            color="fg.muted"
            fontSize={{
              base: "lg",
              md: "xl",
            }}
          >
            Let's get started - The magic you are looking for is in the work you
            are avoiding
          </Text>
        </Stack>
      </Stack>
    </Container>
  </Box>
);
