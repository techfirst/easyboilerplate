require("dotenv").config();

const cookieParser = require("cookie-parser");

const authMiddleware = require("./middleware/authMiddleware");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const publicRoutes = require("./routes/publicRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: process.env.BASE_URL,
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));

//This must be placed before app.use(express.json());
app.use("/api", stripeRoutes);

app.use(express.json());

app.use("/api", publicRoutes);
app.use("/api/user", authMiddleware, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
