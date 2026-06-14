const express = require("express");
const app = express();

app.get("/", (_, res) => {
  res.send("Queue Ticket Bot Running");
});

app.listen(3000, () => {
  console.log("Web server running");
});
