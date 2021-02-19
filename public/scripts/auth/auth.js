// Firebase setup
firebase.initializeApp({
  projectId: 'product-inventory-manager',
  appId: '1:729377056436:web:7c321d1ecdd3ba831a59e1',
  databaseURL: 'https://product-inventory-manager-default-rtdb.firebaseio.com',
  apiKey: 'AIzaSyDi3hy7PunKTxs4vAPpmsaWMPMbnuQUhqE',
  authDomain: 'product-inventory-manager.firebaseapp.com',
});

// Auth and Firestore references.
const auth = firebase.auth();
const db = firebase.firestore();

// Update Firestore settings.
db.settings({ timestampsInSnapshots: true });

// End of Firebase setup

// Listen for authentication status changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    // Get db data
    db.collection('items')
      .get()
      .then((snapshot) => {
        setupItems(snapshot.docs);
      });

    document.getElementById('account-details-li').style.display = '';
    document.getElementById('logout-li').style.display = '';
    document.getElementById('create-new-item-li').style.display = '';
    document.getElementById('login-li').style.display = 'none';
    document.getElementById('sign-up-li').style.display = 'none';
  } else {
    // User logged out
    setupItems([]);

    document.getElementById('account-details-li').style.display = 'none';
    document.getElementById('logout-li').style.display = 'none';
    document.getElementById('create-new-item-li').style.display = 'none';
    document.getElementById('login-li').style.display = '';
    document.getElementById('sign-up-li').style.display = '';
  }
});

// Sign Up
const signUpForm = document.querySelector('#signup-form');
signUpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Getting user info
  const email = signUpForm['signup-email'].value;
  const password = signUpForm['signup-password'].value;

  // Sign Up user
  auth.createUserWithEmailAndPassword(email, password).then((credential) => {
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signUpForm.reset();
  });
});

// Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// Login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // Log user in
  auth.signInWithEmailAndPassword(email, password).then(() => {
    // Close signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });
});
