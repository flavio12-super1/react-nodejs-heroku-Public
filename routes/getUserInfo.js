const User = require("../models/User");
const Room = require("../models/Room");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      console.log(user.username);
      console.log(req.session.passport.user.username);

      const room = await Room.findOne({ roomID: user.userPostsList });

      if (room) {
        console.log("posts" + room.message);
      }

      if (user.username == req.session.passport.user.username) {
        console.log("you have access to make edits");
        res.send({
          msg: "pass",
          access: "allowed",
          username: user.username,
          data: room.message,
        });
      } else {
        console.log("you dont have access to make edits");
        res.send({
          msg: "pass",
          access: "dennied",
          username: user.username,
          data: room.message,
        });
      }
    } else {
      res.send({
        msg: "failed",
      });
    }
  } catch {
    res.send({ msg: "error" });
  }
});

module.exports = router;
