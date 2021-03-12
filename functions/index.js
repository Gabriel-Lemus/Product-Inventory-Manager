const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Admin app initialization from the server side.
admin.initializeApp();

// Clodu function that sets the user's company info.
exports.setCompanyInfo = functions.https.onCall((data, context) => {
  if (context.auth.uid !== null) {
    return admin
      .auth()
      .getUserByEmail(data.email)
      .then((user) => {
        return admin.auth().setCustomUserClaims(user.uid, {
          company: data.company,
          ...user.customClaims,
        });
      })
      .then(() => {
        return { message: `${data.email} info has been set succesfully!` };
      })
      .catch((error) => {
        return error;
      });
  } else {
    return {
      error:
        "Please login and make sure you have admin privileges before trying to change users' information.",
    };
  }
});

// Cloud function that sets the admin role for a user.
exports.setAdminRole = functions.https.onCall((data, context) => {
  // Check if the request is being made by an admin or if it is for a newly
  // created user.
  if (context.auth.token.admin === true || data.isNewlyCreatedUser) {
    // Check if the user is logged in.
    if (context.auth.uid !== null) {
      // Get user and add custom claim (admin).
      return admin
        .auth()
        .getUserByEmail(data.email)
        .then((user) => {
          user.customClaims;
          return admin.auth().setCustomUserClaims(user.uid, {
            admin: data.bool,
            ...user.customClaims,
          });
        })
        .then(() => {
          if (data.bool) {
            return {
              message: `${data.email} has been made an admin`,
            };
          } else {
            return {
              message: `${data.email} was removed as admin.`,
            };
          }
        })
        .catch((error) => {
          return error;
        });
    } else {
      return {
        error:
          "You need to be signed in and be an admin to modify the admin privileges of other users' of the company you belong to.",
      };
    }
  } else {
    return { error: 'Only admins can modify other users admin privileges.' };
  }
});
