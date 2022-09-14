//Required Imports
const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
const colors = require("colors");
const connectDb = require("./src/lib/db");
const helmet = require("helmet");
require("dotenv").config();

//Connection Function
const conn = connectDb();

//Init app
const app = express();

//Adding required configs
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV == "development") app.use(morgan("dev"));

//Home Route
app.get("/", async (req, res, next) => {
  res.send({ message: "Awesome it works 🐻" });
});

//Main application routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/item", require("./src/routes/item"));
app.use("/api/user", require("./src/routes/user"));

//Route not found & Error routes
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

//Establishing port number
const PORT = process.env.PORT || 3000;

//Running the server
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV == "production") {
    console.log(`🚀 @ ${process.env.PROD_BASE_URL}`.green.bold);
  } else {
    console.log(`🚀 @ http://localhost:3000`.blue.bold);
  }
});

//Restart on unexpected errors
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
