require("dotenv").config();

const express = require("express");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
