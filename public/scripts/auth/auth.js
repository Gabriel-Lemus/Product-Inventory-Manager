// Listen for authentication status changes.
auth.onAuthStateChanged((user) => {
  if (user) {
    // Check if user has admin role.
    user.getIdTokenResult().then((idTokenResult) => {
      user.admin = idTokenResult.claims.admin;
      // console.log(idTokenResult.claims);
      // console.log(auth.currentUser.email);
      setupUI(user);
    });

    // User is logged in; get db data.
    db.collection('Users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        db.collection('Companies_Data')
          .doc('Inventories')
          .collection(doc.data().Company_Name)
          .onSnapshot((snapshot) => {
            setupItems(snapshot.docs, user.emailVerified);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  } else {
    // User is logged out.
    setupUI();
    showPageInfo();
  }
});

// Add new item to inventory.
const newItemForm = document.querySelector('#new-item-form');
newItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let loader = document.getElementById('add-new-item-loader');
  loader.style.display = 'block';

  // Prevent unlogged users from accessing the DB.
  if (auth.currentUser === null) {
    M.toast({
      html:
        "Please sign in before attempting to access your company's database.",
    });
    // Leave a time for the user to read the message
    setTimeout(() => {
      location.reload();
      loader.style.display = 'none';
    }, 2500);
  } else {
    if (auth.currentUser.admin && auth.currentUser.emailVerified) {
      // Attempt to add new item to inventory or catch the error.
      db.collection('Users')
        .doc(auth.currentUser.uid)
        .get()
        .then((doc) => {
          db.collection('Companies_Data')
            .doc('Inventories')
            .collection(doc.data().Company_Name)
            .doc(newItemForm['item-name'].value)
            .set({
              name: newItemForm['item-name'].value,
              quantity: parseInt(newItemForm['item-quantity'].value),
            })
            .then(() => {
              // Reset form and close the modal.
              const modal = document.querySelector('#modal-create-new-item');
              M.Modal.getInstance(modal).close();
              newItemForm.reset();
              loader.style.display = 'none';
            })
            .catch((error) => {
              console.log(error.message);
            });
        });
    } else if (!auth.currentUser.emailVerified) {
      M.toast({
        html:
          "Please verify your email before attempting to modify your company's inventory.",
      });

      setTimeout(() => {
        location.reload();
        loader.style.display = 'none';
      }, 2750);
    } else {
      M.toast({
        html:
          "As you are not an admin, you cannot modify your company's database.",
      });

      setTimeout(() => {
        location.reload();
        loader.style.display = 'none';
      }, 2750);
    }
  }
});

// Add admin role to user.
const adminForm = document.querySelector('#make-user-admin-form');
adminForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let loader = document.getElementById('make-user-admin-loader');
  loader.style.display = 'block';
  const adminEmail = document.querySelector('#new-admin-email').value;
  setAdminRole({ email: adminEmail, bool: true }).then((result) => {
    M.toast({ html: result.data.message });
    const modal = document.querySelector('#modal-make-user-admin');
    M.Modal.getInstance(modal).close();
    signUpForm.reset();
    loader.style.display = 'none';
    // location.reload();
  });
});

// Send the user a verification email.
function verifyEmail() {
  auth.currentUser
    .sendEmailVerification()
    .then(() => {
      M.toast({
        html: 'A verification email has been sent, please verify it.',
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

// Send password reset email.
function resetPassword(email) {
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      M.toast({ html: `A password reset email has been sent to: ${email}` });
    })
    .catch((error) => {
      console.log(error);
    });
}

// Sign Up.
const signUpForm = document.querySelector('#signup-form');
signUpForm.addEventListener('submit', (e) => {
  let _credential;
  e.preventDefault();

  // Getting user info.
  const email = signUpForm['signup-email'].value;
  const password = signUpForm['signup-password'].value;
  const passwordConfirmation = signUpForm['signup-password-confirmation'].value;
  let loader = document.getElementById('sign-up-loader');
  loader.style.display = 'block';

  // Leave a time for backend to examine the user credentials.
  setTimeout(() => {
    // Check if a company with the same name doesn't exist already.
    db.collection('Companies_Data')
      .doc('Companies')
      .collection(signUpForm['company-name'].value)
      .get()
      .then((subcollection) => {
        if (subcollection.docs.length > 0) {
          // An existent company has the same name.
          M.toast({
            html:
              "We're sorry. An existent company has the same name as the one you requested. Please pick another name for your company.",
          });
          setTimeout(() => {
            let companyNameInput = document.getElementById('company-name');
            companyNameInput.value = '';
            companyNameInput.classList.remove('active');
            companyNameInput.classList.remove('valid');
            loader.style.display = 'none';
          }, 2250);
        } else {
          // Check if passwords match.
          if (password === passwordConfirmation) {
            // Sign up user.
            auth
              .createUserWithEmailAndPassword(email, password)
              .then((credential) => {
                // Send email verification
                verifyEmail(email);

                return db.collection('Users').doc(credential.user.uid).set({
                  Name: signUpForm['user-name'].value,
                  Company_Name: signUpForm['company-name'].value,
                  Email: email,
                });
              })
              .then(() => {
                setAdminRole({
                  email: email,
                  bool: true,
                  isNewlyCreatedUser: true,
                })
                  .then((adminResult) => {
                    setCompanyInfo({
                      email: email,
                      company: signUpForm['company-name'].value,
                    })
                      .then((companyInfoResult) => {
                        // console.log(adminResult);
                        // console.log(companyInfoResult);
                        db.collection('Companies_Data')
                          .doc('Companies')
                          .collection(signUpForm['company-name'].value)
                          .doc('Company_Details')
                          .set({
                            Name: signUpForm['company-name'].value,
                            Members: [signUpForm['user-name'].value],
                            Number_of_Members: 1,
                          })
                          .then(() => {
                            auth.signOut().then(() => {
                              auth
                                .signInWithEmailAndPassword(email, password)
                                .then(() => {
                                  const modal = document.querySelector(
                                    '#modal-signup'
                                  );
                                  M.Modal.getInstance(modal).close();
                                  signUpForm.reset();
                                  loader.style.display = 'none';
                                  location.reload();
                                });
                            });
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              });
          } else {
            // Passwords do not match.
            M.toast({ html: 'Passwords do not match.' });
            let signUp = document.getElementById(
              'signup-password-confirmation'
            );
            signUp.value = '';
            signUp.classList.remove('active');
            signUp.classList.remove('valid');
            loader.style.display = 'none';
          }
        }
      }, 1750);
  });
});

// Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  let loader = document.getElementById('logout-loader');
  loader.style.display = 'block';
  // Leave time for Firebase to save user data and logout.
  setTimeout(() => {
    auth.signOut();
    loader.style.display = 'none';
    location.reload();
  }, 1750);
});

// Login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let loader = document.getElementById('login-loader');
  loader.style.display = 'block';

  // Get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // Log user in
  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      // Close signup modal & reset form
      const modal = document.querySelector('#modal-login');
      M.Modal.getInstance(modal).close();
      loginForm.reset();
      loader.style.display = 'none';
      location.reload();
    })
    .catch((error) => {
      // Leave a time for the users to read the given message.
      setTimeout(() => {
        let loginPasswordInput = document.getElementById('login-password');
        let loader = document.getElementById('login-loader');
        if (
          error.message ==
          'The password is invalid or the user does not have a password.'
        ) {
          M.toast({
            html: 'Your password is incorrect. Please re-enter your password.',
          });
          loginPasswordInput.value = '';
          loginPasswordInput.classList.remove('active');
          loginPasswordInput.classList.remove('valid');
          console.clear();
        } else if (
          error.message ==
          'There is no user record corresponding to this identifier. The user may have been deleted.'
        ) {
          M.toast({
            html:
              "We couldn't find a user associated with this email address. Please make sure your credentials are correct.",
          });
          loginPasswordInput.value = '';
          loginPasswordInput.classList.remove('active');
          loginPasswordInput.classList.remove('valid');
          console.clear();
        } else {
          M.toast({
            html: 'Something went wrong. Please re-enter your information.',
          });
          console.log(error.message);
        }
        loader.style.display = 'none';
      }, 750);
    });
});
