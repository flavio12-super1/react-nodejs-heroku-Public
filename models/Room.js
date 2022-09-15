const mongoose = require("mongoose");

const Data = mongoose.Schema({
  username: {
    type: String,
  },
  message: {
    type: Object,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
});

const RoomScheme = mongoose.Schema({
  roomID: {
    type: Number,
    required: true,
  },
  message: {
    type: [Data],
  },
});

module.exports = mongoose.model("room", RoomScheme);
