const express = require("express");
const app = require("express")();

const path = require("path");
const cors = require("cors");
const http = require("http").createServer(app);

const port = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: false }));

//cors
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
//resolve path for front end
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.post("/getInfo", (req, res) => {
  res.send("hello new user");
});

http.listen(port, function () {
  console.log(`listening on port ${port}`);
});
