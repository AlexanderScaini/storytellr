// server side helper functions

const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

// login user if exists, else return error
const login = (email, password, database) => {
  return database.getUserFromEmail(email).then((existingUser) => {
    // console.log('user in database:', existingUser);
    if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
      // if (password = 'password') {
      return existingUser;
    } else {
      return null;
    }
  });
  // .catch((error) => console.log(error.message));
};
// register user if new, else return error
const register = (name, email, password, database) => {
  return database
    .getUserFromEmail(email)
    .then((existingUser) => {
      if (existingUser) {
        return null;
      }
      password = bcrypt.hashSync(password, salt);
      return { name, email, password };
    })
    .then((user) => {
      console.log("register function user: ", user);
      if (!user) {
        return null;
      }
      return database.addUser(user);
    });
};

const branchFilterAndSort = (branchArr) => {
  // first sort the branches by date approved
  const sortedBranches = branchArr.sort(
    (a, b) => a.date_approved - b.date_approved
  );
  // then filters out the branches which have not been approved
  const approvedBranches = sortedBranches.filter(
    (x) => x.date_approved !== null
  );
  return approvedBranches;
};

// const populateKeywordArray = (keywordsQueryArr) => {
//   if (keywordsQueryArr.length > 0) {
//     let keys = [];
//     for (let entry of keywords) {
//       keys.push(entry.keywords);
//     }
//   } else {
//     let keys = ``;
//   }
//   return keys;
// };

module.exports = {
  login,
  register,
  branchFilterAndSort,
  // populateKeywordArray,
};
