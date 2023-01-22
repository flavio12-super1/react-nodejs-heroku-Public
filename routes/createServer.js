const Server = require("../models/Server");
const User = require("../models/User");
const Message = require("../models/Message");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { serverName, user } = req.body;
  console.log(serverName);

  console.log("username: " + user.username + " userID: " + user.userID);

  const message = new Message({
    message: [],
  });

  message.save(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      const messageID = result._id;

      const users = {
        username: user.username,
        userID: user.userID,
      };
      var server = new Server({
        serverName: serverName,
        users: [users],
        message: messageID,
      });
      server.save(function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(
            "server id: " +
              result._id +
              "server name: " +
              result.serverName +
              "server message id: " +
              result.message
          );

          User.findOneAndUpdate(
            { _id: user.userID },
            {
              $push: {
                serversList: result._id,
              },
            },
            { returnOriginal: false },
            function (err, result) {
              if (err) {
                console.log(err);
              } else {
                console.log(result);
              }
            }
          );

          const data = result;
          res.send(data);
        }
      });
    }
  });
});

module.exports = router;
