const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

router.post("/", async (req, res) => {
  const userMessages = [];
  try {
    const message = await Message.findOne({ _id: req.body.roomID });

    async function getMessage(i) {
      console.log(message.message);
      console.log("messageReferance: " + message.message[i].messageReferance);

      var result = message.message.filter((obj) => {
        return obj._id == message.message[i].messageReferance;
      });
      let replyToMessage = result[0].message[0].children[0].text;
      console.log(replyToMessage);
      const pushData = {
        name: message.message[i].name,
        message: message.message[i].message,
        images: message.message[i].images,
        _id: message.message[i]._id,
        messageReferanceText: replyToMessage,
      };
      console.log(pushData);
      userMessages.push(pushData);
    }

    async function processArray() {
      //check if room exits
      for (let i = 0; i < message.message.length; i++) {
        if (message.message[i].messageReferance != "") {
          console.log(message.message[i].messageReferance);
          await getMessage(i);
        } else {
          userMessages.push(message.message[i]);
        }
      }
      console.log("done");
    }
    await processArray();
    console.log("sending array");

    res.send({
      userMessages,
    });
  } catch {
    res.send({ msg: "error" });
  }
});

module.exports = router;
