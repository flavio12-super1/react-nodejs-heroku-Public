const Room = require("../models/Room");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const userPosts = [];

  try {
    for (let i = 0; i < req.body.friendPostsId.length; i++) {
      const room = await Room.findOne({ roomID: req.body.friendPostsId[i] });
      if (room) {
        for (let x = 0; x < room.message.length; x++) {
          userPosts.push(room.message[x]);
          console.log("posts" + room.message[x]);
        }
      }
    }
    res.send(userPosts);
  } catch {
    res.send({ msg: "error" });
  }
});

module.exports = router;
