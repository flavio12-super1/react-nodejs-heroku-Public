const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/User");

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    const user = await User.findOne({ username: username });
    // console.log(user);
    if (user == null) {
      return done(null, false, { msg: "user doesnt exist" });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user, { msg: "pass" });
      } else {
        return done(null, false, { msg: "incorrect password" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticateUser)
  );
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser(async (user, done) => {
    const foundUser = await User.findOne({ username: user.username });
    return done(null, foundUser);
  });
}

module.exports = initialize;
