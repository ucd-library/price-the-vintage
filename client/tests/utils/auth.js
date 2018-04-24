let auth = require('../../public/src/models/AuthModel');
let admin = require('./firebase-admin');

// login test user
let auth0Profile = {
  email : TEST_UID,
  email_verified : true,
  firebase_data : {
    email : TEST_UID,
    isAdmin : true
  },
  photoURL : 'foo',
  user_id : TEST_UID,
  uid : TEST_UID,
  role : 'admin',
  roles : ['admin']
};

module.exports = {
  login : async function() {
    auth.setUserProfile(auth0Profile);
    let token = await admin.auth().createCustomToken(TEST_UID);
    return auth.loginCustom(token);
  },
  logout : function() {
    return auth.logout();
  }
}