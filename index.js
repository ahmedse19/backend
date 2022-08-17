const fecha = require("fecha");
const express = require("express");
var cors = require("cors");
const notFound = (req, res) => res.status(404).send("Route does not exist");
const router = require("./routes/dashboardRoutes");
const app = express();
app.use(cors());
app.use("/api", router);

app.use(notFound);

port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
