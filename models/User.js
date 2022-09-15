const mongoose = require("mongoose");

const Friend = mongoose.Schema({
  username: {
    type: String,
  },
  userID: {
    type: String,
  },
});

const UserScheme = mongoose.Schema({
  emailAddress: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  notifications: {
    type: [Friend],
  },
  outGoingNotifications: {
    type: [{ type: String }],
  },
  friendsList: {
    type: [Friend],
  },
});

module.exports = mongoose.model("user", UserScheme, "users");
