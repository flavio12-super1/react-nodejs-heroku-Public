const mongoose = require("mongoose");

const User = mongoose.Schema({
  username: {
    type: String,
  },
  userID: {
    type: String,
  },
});

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

const ServerScheme = mongoose.Schema({
  serverName: {
    type: String,
    required: true,
  },
  users: {
    type: [User],
  },
  message: {
    type: String,
  },
});

module.exports = mongoose.model("server", ServerScheme, "servers");
