// Email and reset button.
let email = document.getElementById('reset-email').value;
const resetBtn = document.getElementById('reset-password-btn');
const snackBar = document.getElementById('snackbar');

// Set snackbar/toast.
function setSnackBar(text) {
  snackBar.innerHTML = text;
  snackBar.className = 'show';
  setTimeout(() => {
    snackBar.className = snackBar.className.replace('show', '');
  }, 3000);
}

// Send password reset email when the user clicks the button.
resetBtn.addEventListener('click', () => {
  email = document.getElementById('reset-email').value;
  if (email != '') {
    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        setSnackBar(`A password reset email has been sent to: ${email}`);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    setSnackBar('Please enter a valid email and press the button again.');
  }
});
