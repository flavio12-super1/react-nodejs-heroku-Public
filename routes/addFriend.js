const User = require("../models/User");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    User.findOne({ username: req.body.myUsername }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          req.body.myUsername + " made friends with " + req.body.username
        );
        User.updateOne(
          { _id: docs.id },
          {
            $push: {
              friendsList: {
                username: `${req.body.username}`,
                userID: `${req.body.userID}`,
                postsId: `${req.body.postsId}`,
              },
            },
          },
          function (err, result) {
            if (err) {
              console.log(err);
              res.send({ msg: "error" });
            } else {
              console.log("friend added" + result);
              res.send({ msg: "pass" });
            }
          }
        );
      }
    });
  } catch {
    res.send({ msg: "error" });
  }
});

module.exports = router;
