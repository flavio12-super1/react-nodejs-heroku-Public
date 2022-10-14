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

const MessageScheme = mongoose.Schema({
  message: {
    type: [Data],
  },
});

module.exports = mongoose.model("message", MessageScheme, "messages");
