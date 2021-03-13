// Firebase setup
firebase.initializeApp({
  projectId: 'product-inventory-manager',
  appId: '1:729377056436:web:7c321d1ecdd3ba831a59e1',
  apiKey: 'AIzaSyAtB4xgwEaQoTPxxK8nqCVTTyDOxLtBiyw',
  authDomain: 'product-inventory-manager.firebaseapp.com',
});

// Auth and Firestore references.
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// Update Firestore settings.
db.settings({ timestampsInSnapshots: true });

// End of Firebase setup.

// Cloud Functions.
const setCompanyInfo = functions.httpsCallable('setCompanyInfo');
const setAdminRole = functions.httpsCallable('setAdminRole');

// Function that returns the user's inventory name.
async function userDataPromise(user) {
  return db.collection('Users').doc(user.uid).get();
}

// Function that returns the user's company's inventory.
// async function getUserDB(user) {
//   let userCompany = await userDataPromise(user).then((doc) => {
//     userCompany = doc.data().Company_Name;
//   });

//   db.collection('Companies_Data')
//     .doc('Inventories')
//     .collection(userCompany)
//     .get();
// }

// Function that checks if a given email belongs to a registered user of the
// given company.
function checkIfEmailIsRegistered(email, companyName) {
  _helper.isRegistered = false;
  db.collection('Users')
    .where('Company_Name', '==', companyName)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (email == doc.data().Email) {
          _helper.isRegistered = true;
        }
      });
    });
}
