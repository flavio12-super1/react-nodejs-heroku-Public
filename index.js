const express = require("express");
require("dotenv").config();
const app = require("express")();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const http = require("http").createServer(app);
const port = process.env.PORT || 8000;
const dburl = process.env.DBURL;

const crypto = require("crypto");

//routes
const User = require("./models/User");
const Room = require("./models/Room");
const Server = require("./models/Server");
const Message = require("./models/Message");

//mongoose db
const mongoose = require("mongoose");
mongoose.connect(dburl, { useNewUrlParser: true });
const mdb = mongoose.connection;
mdb.on("error", (error) => console.error(error));
mdb.once("open", () => console.log("Connected to Mongoose"));
//passport
const initializePassport = require("./passport-config");
const e = require("express");
initializePassport(passport);

app.use(express.urlencoded({ extended: false }));
app.use(flash());

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  name: "userInfo",
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);

//https://medium.com/@alysachan830/cookie-and-session-ii-how-session-works-in-express-session-7e08d102deb8

app.use(passport.initialize());
app.use(passport.session());
//cors
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

// only allow authenticated users
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.authenticated) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

//resolve path for front end
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.get("/", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("/lurker", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("/lurker/messages/:id", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});
app.get("/lurker/:username", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.get("*", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

io.on("connection", (socket) => {
  console.log(socket.request.session.passport.user._id);
  socket.userID = socket.request.session.passport.user._id;
  // join the "userID" room
  socket.join(socket.userID);
  //https://mongoosejs.com/docs/tutorials/findoneandupdate.html
  socket.on("message", async (data) => {
    if (data.messageReferance != "") {
      Message.findOne(
        { _id: data.room },
        { message: { $elemMatch: { _id: data.messageReferance } } },
        function (err, result) {
          let replyToMessage = result.message[0].message[0].children[0].text;
          Message.findOneAndUpdate(
            { _id: data.room },
            {
              $push: {
                message: {
                  name: data.name,
                  message: data.message,
                  images: data.images,
                  messageReferance: data.messageReferance,
                },
              },
            },
            { returnOriginal: false },
            function (err, object) {
              if (err) {
                console.log(err);
              } else {
                const pushData = {
                  name: data.name,
                  message: data.message,
                  images: data.images,
                  _id: object.message[object.message.length - 1]._id,
                  messageReferanceText: replyToMessage,
                };
                io.sockets.in(data.room).emit("message", pushData);
              }
            }
          );
        }
      );
    } else {
      Message.findOneAndUpdate(
        { _id: data.room },
        {
          $push: {
            message: {
              name: data.name,
              message: data.message,
              images: data.images,
              messageReferance: "",
            },
          },
        },
        { returnOriginal: false },
        function (err, result) {
          console.log(result);
          if (err) {
            console.log(err);
          } else {
            const pushData = {
              name: data.name,
              message: data.message,
              images: data.images,
              _id: result.message[result.message.length - 1]._id,
            };
            io.sockets.in(data.room).emit("message", pushData);
          }
        }
      );
    }
  });

  socket.on("joinRoom", (room) => {
    socket.join(room.room);
    console.log("joined => " + room.room);
  });

  socket.on("sendRequest", (username, myUsername, userID) => {
    User.findOne({ username: username })
      .then((result) => {
        if (result) {
          console.log("request made to: " + username + " from: " + myUsername);
          io.to(result.id).emit("friendRequest", myUsername, userID);
          io.to(userID).emit("requestUpdate", username, {
            emitEvent: true,
          });
          console.log(result.username);
          User.updateOne(
            { username: username },
            {
              $push: {
                notifications: {
                  username: myUsername,
                  userID: userID,
                },
              },
            },
            function (err, result) {
              if (err) {
                console.log(err);
              } else {
                console.log(result);
              }
            }
          );
          User.updateOne(
            { username: myUsername },
            {
              $push: {
                outGoingNotifications: username,
              },
            },
            function (err, result) {
              if (err) {
                console.log(err);
              } else {
                console.log(result);
              }
            }
          );
        } else {
          io.to(userID).emit("requestUpdate", username, {
            emitEvent: false,
          });
          console.log("user doenst exist");
        }
        return result;
      })
      .catch((err) => console.error(`Failed to find document: ${err}`));
  });
  socket.on("cancelRequest", (msg, myUsername) => {
    User.findOne({ username: msg }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          "friend request canceled to: " + msg + " from: " + myUsername
        );
        io.to(docs.id).emit("friendRequestCancel", myUsername);
        User.updateOne(
          { _id: docs.id },
          {
            $pull: {
              notifications: {
                username: myUsername,
              },
            },
          },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
            }
          }
        );
      }
    });
    User.findOne({ username: myUsername }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          "outgoing request made to: " + msg + " from: " + myUsername
        );

        User.updateOne(
          { _id: docs.id },
          {
            $pull: {
              outGoingNotifications: msg,
            },
          },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
            }
          }
        );
      }
    });
  });
  socket.on("acceptRequest", (msg, myUsername, userID, postsId) => {
    User.findOne({ username: myUsername }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          "friend request accepted by: " + myUsername + " from: " + msg
        );

        User.updateOne(
          { _id: docs.id },
          {
            $pull: {
              notifications: {
                username: msg,
              },
            },
          },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              crypto.randomBytes(8, (err, buf) => {
                if (err) throw err;
                const myUsernameId = docs.id;

                const message = new Message({
                  message: [],
                });

                message.save(function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    const messageID = result._id;

                    console.log(
                      `${buf.length} bytes of random data: ${messageID}`
                    );

                    io.to(userID).emit(
                      "friendRequestAccepted",
                      myUsername,
                      messageID,
                      postsId
                    );
                    //start of new
                    User.findOne({ username: msg }, function (err, docs) {
                      console.log(`${msg}: ` + docs.userPostsList);
                      if (err) {
                        console.log(err);
                      } else {
                        User.updateOne(
                          { username: msg },
                          {
                            $pull: {
                              outGoingNotifications: myUsername,
                            },
                          },
                          function (err, result) {
                            if (err) {
                              console.log(err);
                            } else {
                              io.to(myUsernameId).emit(
                                "friendRoomId",
                                msg,
                                messageID,
                                docs.userPostsList
                              );
                              console.log(result);
                            }
                          }
                        );
                      }
                    });
                  }
                });
              });
              console.log(result);
            }
          }
        );
      }
    });
  });
  socket.on("denyRequest", (msg, myUsername, userID) => {
    User.findOne({ username: myUsername }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          "friend request accepted by: " + myUsername + " from: " + msg
        );

        User.updateOne(
          { _id: docs.id },
          {
            $pull: {
              notifications: {
                username: msg,
              },
            },
          },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              io.to(userID).emit("friendRequestDenied", myUsername);
              console.log(result);
            }
          }
        );
      }
    });
    User.updateOne(
      { username: msg },
      {
        $pull: {
          outGoingNotifications: myUsername,
        },
      },
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      }
    );
  });

  socket.on("createPost", async (data) => {
    Room.updateOne(
      { roomID: data.room },
      {
        $push: {
          message: {
            name: data.name,
            message: data.message,
            images: data.images,
          },
        },
      },
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      }
    );
    console.log(
      data.name +
        " => " +
        data.message +
        " images: " +
        "<images>" +
        " room: " +
        data.room
    );
  });
  socket.on("leaveRoom", (room) => {
    socket.leave(room.room);
    console.log("leaft => " + room.room);
  });
});

// roomID and room
app.post("/getMessages", async (req, res) => {
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

app.post("/getUserData", async (req, res) => {
  const userServers = [];
  try {
    const user = await User.findOne({ username: req.body.username });

    console.log(user);

    for (let i = 0; i < user.serversList.length; i++) {
      const server = await Server.findOne({ _id: user.serversList[i] });
      if (server) {
        userServers.push(server);
        console.log("server info" + server);
      }
    }

    res.send({
      msg: "pass",
      friendsList: user.friendsList,
      notifications: user.notifications,
      outGoingNotifications: user.outGoingNotifications,
      serversList: userServers,
    });
  } catch {
    res.send({ msg: "error" });
  }
});

app.post("/getUserPosts", async (req, res) => {
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

app.post("/getUserInfo", async (req, res) => {
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

app.post("/addFriend", async (req, res) => {
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

app.post("/createServer", async (req, res) => {
  const { serverName, user } = req.body;
  console.log(serverName);

  console.log("username: " + user.username + " userID: " + user.userID);

  const message = new Message({
    message: [],
  });

  message.save(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      const messageID = result._id;

      const users = {
        username: user.username,
        userID: user.userID,
      };
      var server = new Server({
        serverName: serverName,
        users: [users],
        message: messageID,
      });
      server.save(function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(
            "server id: " +
              result._id +
              "server name: " +
              result.serverName +
              "server message id: " +
              result.message
          );

          User.findOneAndUpdate(
            { _id: user.userID },
            {
              $push: {
                serversList: result._id,
              },
            },
            { returnOriginal: false },
            function (err, result) {
              if (err) {
                console.log(err);
              } else {
                console.log(result);
              }
            }
          );

          const data = result;
          res.send(data);
        }
      });
    }
  });
});

app.post("/joinServer", async (req, res) => {
  const { serverID, user } = req.body;
  console.log(serverID);

  console.log("username: " + user.username + " userID: " + user.userID);

  const users = {
    username: user.username,
    userID: user.userID,
  };

  Server.findOneAndUpdate(
    { _id: serverID },
    {
      $push: {
        users: [users],
      },
    },
    { returnOriginal: false },
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        User.findOneAndUpdate(
          { _id: user.userID },
          {
            $push: {
              serversList: result._id,
            },
          },
          { returnOriginal: false },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
            }
          }
        );

        console.log(result);
        const data = result;
        res.send(data);
      }
    }
  );

  // const users = {
  //   username: user.username,
  //   userID: user.userID,
  // };
  // var server = new Server({
  //   serverName: serverName,
  //   users: [users],
  //   message: messageID,
  // });

  // server.save(function (err, result) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(
  //       "server id: " +
  //         result._id +
  //         "server name: " +
  //         result.serverName +
  //         "server message id: " +
  //         result.message
  //     );

  //     User.findOneAndUpdate(
  //       { _id: user.userID },
  //       {
  //         $push: {
  //           serversList: result._id,
  //         },
  //       },
  //       { returnOriginal: false },
  //       function (err, result) {
  //         if (err) {
  //           console.log(err);
  //         } else {
  //           console.log(result);
  //         }
  //       }
  //     );

  //     const data = result;
  //     res.send(data);
  //   }
  // });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.send({ msg: "error" });
      throw err;
    }
    if (!user) res.send({ msg: info.msg });
    else {
      req.login(user, (err) => {
        if (err) throw err;
        req.session.authenticated = true;
        res.send({ msg: info.msg, user: user });
      });
    }
  })(req, res, next);
});

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (email && username && password) {
      if (!validateEmail(email)) {
        res.send({ msg: "please enter a valid email" });
      } else if (username.length < 8) {
        res.send({ msg: "please enter a valid username" });
      } else if (password.length < 8) {
        res.send({ msg: "please enter a valid password" });
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        crypto.randomBytes(8, (err, buf) => {
          if (err) throw err;

          const roomID = buf.toString("hex");

          console.log(`${buf.length} bytes of random data: ${roomID}`);

          var room = new Room({
            roomID: roomID,
            message: [],
          });

          room.save(function (err, result) {
            if (err) {
              console.log(err);
            } else {
              var user = new User({
                emailAddress: email,
                username: username,
                password: hashedPassword,
                userPostsList: roomID,
              });

              User.findOne({ username: username }, function (err, docs) {
                if (err) {
                  console.log(err);
                }
                if (docs) {
                  res.send({ msg: "username all ready exists" });
                } else {
                  user.save(function (err, result) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(result);
                      res.send({ msg: "pass" });
                    }
                  });
                }
              });
              console.log(result);
            }
          });
        });
      }
    }
  } catch {
    res.redirect("/register");
  }
});

app.post("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      res.send({ msg: "error" });
      return next(err);
    } else {
      res.send({ msg: "pass" });
    }
  });
});

//auth middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/lurker");
  }
  next();
}

http.listen(port, function () {
  console.log(`listening on port ${port}`);
});
