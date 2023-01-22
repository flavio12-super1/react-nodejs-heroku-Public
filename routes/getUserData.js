const express = require("express");
const User = require("../models/User");
const Server = require("../models/Server");
const router = express.Router();

router.post("/", async (req, res) => {
  const userServers = [];
  try {
    const user = await User.findOne({ username: req.body.username });

    console.log(user);

    for (let i = 0; i < user.serversList.length; i++) {
      const server = await Server.findOne({ _id: user.serversList[i] });
      if (server) {
        userServers.push(server);
        console.log("server info" + server);
      }
    }

    res.send({
      msg: "pass",
      friendsList: user.friendsList,
      notifications: user.notifications,
      outGoingNotifications: user.outGoingNotifications,
      serversList: userServers,
    });
  } catch {
    res.send({ msg: "error" });
  }
});

module.exports = router;
