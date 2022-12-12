// to grab the secret, use "process.env.JWT"

const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

/* Replace this logic with your own so that you verify the given token was 
signed by your app. If it was, you can use the data in the token to identify
the user and pull all their information from the database. The route should 
ultimately return a full user object.*/

// someone comes up to you with a token -- we need to see if it's legit. if it IS, then we can
// release the precious user info.
// OG   try {
//     const user = await User.findByPk(token);
//     if (user) {
//       return user;
// OG    }
//// YARD: we are trying to pass in a token and VERIFY it.
// signing would give us the token back. in THIS case, we want to take a token and verify (decode) it
// so that we can read the information.
//  try {
// We need to check if jwt.verify(token, secret) is valid. if it IS, we grab the id off of it.
// (if it's not, then we get an error.)
// Brown: var decoded = jwt.verify(token, 'shhhhh'); // THIS is the decode line??
// console.log(decoded.foo) // bar
User.byToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT); // --> returns the object IF the decoder is good.
  console.log("DECODED, ON 46==========", decoded);
  if (decoded) {
    const user = await User.findByPk(decoded.userId);
    console.log("Firing on line 48!!!!!! good token-secret match.");
    console.log("DECODED 50 =============", decoded);
    return user;
  } else {
    console.log("FIRING ON LINE 51 ========= token does NOT match the object.");
  }
};
//     const user = await User.findByPk();
//     //
//     // if (token matches..... something? if token is verified? THEN return the user object.)
//     // brown: is token supposed to match what's in the .env ?
//     // i.e., are we shooting for token = process.env.JWT?
//     if (user) {
//       return user;
//     }
//     // WHEREEEE do we use verify??

//     const error = Error("bad credentials");
//     error.status = 401;
//     throw error;
//   } catch (ex) {
//     const error = Error("bad credentials");
//     error.status = 401;
//     throw error;
//   }

User.authenticate = async ({ username, password }) => {
  // purpose: accept a user&pass and return the corresponding token.
  // this is the log-in fx. with a SUCCESSFUL log-in, you SHOULD get a valid token back.
  // that's the whole point.
  const user = await User.findOne({
    where: {
      username,
      password,
    },
  });
  if (user) {
    return jwt.sign({ userId: user.id }, process.env.JWT);
    // jwt.sign is the move to take an object and EN-code it with the second arg as the decoder.
    // line 66: jwt.sign takes the first arg (an object) to be encoded. the second arg is the secret(decoder).
    // line 66 is returning something like this: [header].[payload].[signature], e.g. dsjf09.j2ei32t.90834ijfdsf
  }
  // sign function: jwt.sign(payload, secretOrPrivateKey, [options, callback])...

  const error = Error("bad credentials, line 91");
  error.status = 401;
  throw error;
};

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
  },
};
