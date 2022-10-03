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

  socket.on("message", async (data) => {
    io.sockets.in(data.room).emit("message", data);
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

                const roomID = buf.toString("hex");
                const myUsernameId = docs.id;

                console.log(`${buf.length} bytes of random data: ${roomID}`);

                io.to(userID).emit(
                  "friendRequestAccepted",
                  myUsername,
                  roomID,
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
                            roomID,
                            docs.userPostsList
                          );
                          console.log(result);
                        }
                      }
                    );
                  }
                });
                //end of new
                var room = new Room({
                  roomID: roomID,
                  message: [],
                });

                room.save(function (err, result) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(result);
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

app.post("/getMessages", async (req, res) => {
  try {
    const room = await Room.findOne({ roomID: req.body.roomID });

    if (room) {
      console.log(room.message);
      res.send({
        data: room.message,
      });
    }
  } catch {
    res.send({ msg: "error" });
  }
});

app.post("/getFriendsList", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user.friendsList) {
      console.log(user.friendsList);
      res.send({
        msg: "pass",
        friendsList: user.friendsList,
        notifications: user.notifications,
        outGoingNotifications: user.outGoingNotifications,
      });
    }
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

  // console.log(req.body.friendPostsId);
  // res.send("loading...");
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
          data: "posts",
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
