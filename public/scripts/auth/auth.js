// Firebase setup
firebase.initializeApp({
  projectId: 'product-inventory-manager',
  appId: '1:729377056436:web:7c321d1ecdd3ba831a59e1',
  apiKey: 'AIzaSyDi3hy7PunKTxs4vAPpmsaWMPMbnuQUhqE',
  authDomain: 'product-inventory-manager.firebaseapp.com',
});

// Auth and Firestore references.
const auth = firebase.auth();
const db = firebase.firestore();

// Update Firestore settings.
db.settings({ timestampsInSnapshots: true });

// End of Firebase setup.

// User Object.
let _user = null;

// Listen for authentication status changes.
auth.onAuthStateChanged((user) => {
  _user = user;

  if (user) {
    // User is logged in; get db data.
    db.collection('users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        db.collection(doc.data().Company_Name + '-items').onSnapshot(
          (snapshot) => {
            setupItems(snapshot.docs);
          }
        );
      });
    setupUI(user);
  } else {
    // User is logged out.
    _user = null;
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
  if (_user === null) {
    M.toast({
      html:
        'Please sign in before attempting to access your companys database.',
    });
    setTimeout(() => {
      location.reload();
      loader.style.display = 'none';
    }, 2500);
  } else {
    // Attempt to add new item to inventory or catch the error.
    db.collection('users')
      .doc(_user.uid)
      .get()
      .then((doc) => {
        db.collection(doc.data().Company_Name + '-items')
          .doc(newItemForm['item-name'].value)
          .set({
            itemName: newItemForm['item-name'].value,
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
  }
});

// Sign Up
const signUpForm = document.querySelector('#signup-form');
signUpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Getting user info
  const email = signUpForm['signup-email'].value;
  const password = signUpForm['signup-password'].value;
  const passwordConfirmation = signUpForm['signup-password-confirmation'].value;
  let loader = document.getElementById('sign-up-loader');
  loader.style.display = 'block';

  setTimeout(() => {
    // Check if passwords match
    if (password === passwordConfirmation) {
      // Sign up user
      auth
        .createUserWithEmailAndPassword(email, password)
        .then((cred) => {
          return db.collection('users').doc(cred.user.uid).set({
            Name: signUpForm['user-name'].value,
            Company_Name: signUpForm['company-name'].value,
            Email: signUpForm['signup-email'].value,
          });
        })
        .then(() => {
          const modal = document.querySelector('#modal-signup');
          M.Modal.getInstance(modal).close();
          signUpForm.reset();
          loader.style.display = 'none';
          location.reload();
        });
    } else {
      // Passwords do not match.
      M.toast({ html: 'Passwords do not match.' });
      let signUp = document.getElementById('signup-password-confirmation');
      signUp.value = '';
      signUp.classList.remove('active');
      signUp.classList.remove('valid');
      loader.style.display = 'none';
    }
  }, 1750);
});

// Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  let loader = document.getElementById('logout-loader');
  loader.style.display = 'block';
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
