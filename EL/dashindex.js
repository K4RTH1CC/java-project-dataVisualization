const express = require("express");
const app = express();

// serve dashboard.html as the root page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dashboard.html");
});

// handle form submission at /select-option route
app.post("/select-option", (req, res) => {
  const selectedOption = req.body.option;

  switch (selectedOption) {
    case "Line Chart":
      res.redirect("/Line Chart");
      break;
    case "Bar Chart":
      res.redirect("/Bar Chart");
      break;
    case "Pie Chart":
      res.redirect("/Pie Chart");
      break;
    default:
      res.status(400).send("Invalid option selected");
  }
});

// serve line.html 
app.get("/Line Chart", (req, res) => {
  res.sendFile(__dirname + "/line.html");
});

// serve bar.html 
app.get("/Bar Chart", (req, res) => {
  res.sendFile(__dirname + "/bar.html");
});

// serve pie.html 
app.get("/Pie Chart", (req, res) => {
  res.sendFile(__dirname + "/pie.html");
});

// start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
