const Server = require("../models/Server");
const User = require("../models/User");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { serverID, user } = req.body;
  console.log(serverID);

  console.log("username: " + user.username + " userID: " + user.userID);

  const users = {
    username: user.username,
    userID: user.userID,
  };

  Server.findOneAndUpdate(
    { _id: serverID },
    {
      $push: {
        users: [users],
      },
    },
    { returnOriginal: false },
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
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

        console.log(result);
        const data = result;
        res.send(data);
      }
    }
  );
});

module.exports = router;
