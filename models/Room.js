const mongoose = require("mongoose");

const Data = mongoose.Schema({
  name: {
    type: String,
  },
  message: {
    type: Object,
    required: false,
  },
  images: {
    type: [String],
    required: false,
  },
  messageReferance: {
    type: String,
  },
});

const RoomScheme = mongoose.Schema({
  roomID: {
    type: String,
    required: true,
  },
  message: {
    type: [Data],
  },
});

module.exports = mongoose.model("room", RoomScheme, "rooms");
