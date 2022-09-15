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
