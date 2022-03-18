// import library
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const database = require("./database");

const { UrlLogger } = require("./utils");
const req = require("express/lib/request");

// create express app
const app = express();

// setting : middleware
app.use(cors({ exposedHeaders: "Authorization" })); // Allow CORS: Access-Control-Allow-Origin. Exposed Headers berfungsi agar header kita yang di kasus ini berisi token dapat terlihat di frontend
app.use(express.json()); // body-parser
app.use(UrlLogger);

// test database connection
database.connect((error) => {
  if (error) console.log(error);
  console.log("connected at thread id", database.threadId); // thread id untuk ngecek berapa kali kita udah connect ke database
});

// create routes
const routes = require("./routes");
app.use(routes.home_route);
app.use("/api", routes.userRoutes);
app.use("/api/auth", routes.authRoutes);
app.use(routes.productRoutes);
app.use(routes.locationRoutes);
app.use(routes.comboRoutes);
app.use(routes.transactionRoutes);

// running server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`server is running at port : ${PORT}`));
