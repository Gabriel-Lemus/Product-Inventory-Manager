// DOM elements
const itemList = document.querySelector('.items');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');

// Setup UI based on user logged status.
const setupUI = (user) => {
  if (user) {
    if (user.admin) {
      // Show admin items if the user has admin role.
      adminItems.forEach((item) => (item.style.display = 'block'));
    }

    // Show account info.
    db.collection('Users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        const accountDetHtml = `
          <h6>Hello, ${doc.data().Name}!</h6>
          <h6>Logged in as ${user.email}</h6>
          <h6>Company: ${doc.data().Company_Name}</h6>
          <h6 class="pink-text">${user.admin ? 'Admin' : ''}</h6>`;

        accountDetails.innerHTML = accountDetHtml;
      })
      .catch((error) => {
        console.log(error.message);
      });

    // Toggle UI elements.
    loggedInLinks.forEach((link) => (link.style.display = 'block'));
    loggedOutLinks.forEach((link) => (link.style.display = 'none'));
  } else {
    // Hide account info.
    accountDetails.innerHTML = '';

    // Toggle UI elements.
    loggedInLinks.forEach((link) => (link.style.display = 'none'));
    loggedOutLinks.forEach((link) => (link.style.display = 'block'));
    adminItems.forEach((item) => (item.style.display = 'none'));
  }
};

// Setup Items
function setupItems(data, emailVerified) {
  if (data.length) {
    let html = '';
    data.forEach((doc) => {
      const item = doc.data();
      if (item.name !== undefined && item.quantity !== undefined) {
        let li = `
        <li>
          <div class="collapsible-header grey lighten-4"> ${item.name} </div>
          <div class="collapsible-body white"> Amount: ${item.quantity} </div>
        </li>
        `;
        html += li;
      }
    });
    itemList.innerHTML = html;
  } else {
    itemList.innerHTML = `
      <p>Your company currently doesn't have any available items.</p>
      <p>Press the 'Add Item' button on the top right corner to add a new item to your company's inventory.</p>`;
    if (!emailVerified) {
      itemList.innerHTML += `<br /><h6 class="center cyan-text">You have not veried your email yet. Please do so.</h6>
      <br /><p class="center">If you would like to receive the email again, please click on the button below.</p>
      <div><button id="resend-verification-link-btn" class="btn yellow darken-2 z-depth-0" onclick="verifyEmail()">Re-send verification link</button></div>`;
    }
  }
}

// Show page info to users that are not signed in.
function showPageInfo() {
  itemList.innerHTML = `
    <h5>About this project</h5>
    <p class="flow-text">Numerous restaurants, groceries, retailers and individuals may face issues related to managing their product inventories, especially when it comes to food. Inventory mismanagement is rampant across the industry despite the best efforts of operations managers, employees, and companies. Mismanagement may result in canceled orders due to inventory shortages, which in turn, lead to revenue losses.</p>
    <p class="flow-text">This project is aimed to solve this problem. This product inventory manager is a webapp that will allow users to keep a tab on their inventories or other items as well as to create alerts whenever perishables will spoil or will deplete.</p>
    <br>
      <div><img id="inv-mngmnt-png" src="./img/inventory_management.png" /></div>
    <p id="img-quote" class="center-align">This web app is aimed to allow users to easily manage their inventories through the use of an intuitive interface.</p>
    <br>
    <h5>Key characteristics</h5>
    <div class="key-char-div">
      <ul class="list">
        <li><em><b><p class="flow-text">Inventory items upload and update</p></b></em></li>
        <div class="key-char-div">
          <ul class="list nested-list">
            <li class="inner-li-txt"><p class="flow-text">The user will be able to upload items and update their quantities by entering data like the product name, quantity, vendor, and Universal Product Code (UPC).</p></li>
            <li class="inner-li-txt"><p class="flow-text">This will allow to eliminate material waste by cycling through the user's inventory in a periodic basis.</p></li>
            <li class="inner-li-txt"><p class="flow-text">It will also enable the user to know their stock level in real time.</p></li>
            <li class="inner-li-txt"><p class="flow-text">Better control of item costs.</p></li>
            <li class="inner-li-txt"><p class="flow-text">This will help users minimize human error as well.</p></li>
          </ul>
        </div>
        <li><em><b><p class="flow-text">Low-stock inventory alerts</p></b></em></li>
        <div class="key-char-div">
          <ul class="list nested-list">
            <li class="inner-li-txt"><p class="flow-text">The webapp will notify the user whenever a product is about to spoil or run out.</p></li>
          </ul>
        </div>
        <li><em><b><p class="flow-text">Reports</p></b></em></li>
        <div class="key-char-div">
          <ul class="list nested-list">
            <li class="inner-li-txt"><p class="flow-text">Analytics and reports will provide the user with a thorough picture of their finances, performance, and periodic activities.</p></li>
            <li class="inner-li-txt"><p class="flow-text">The analysis of this information will enable the user to increase their efficiency as well as profitability.</p></li>
            <li class="inner-li-txt"><p class="flow-text">The reports will include stock levels, profitability, and sales performance (the latter two will only be available to groceries or restaurants).</p></li>
            <div class="key-char-div">
              <ul class="list nested-list">
                <li class="inner-li-txt"><p class="flow-text"><b>Stock reports</b> let the user stay updated on what items they currently have available.</p></li>
                <li class="inner-li-txt"><p class="flow-text"><b>Profitability reports</b> can help the user visualize their income flow by comparing outflows with inflows. Also, they will be able to know their profit margins for items.</p></li>
                <li class="inner-li-txt"><p class="flow-text"><b>Sales reports</b> will let the user see which items are not selling as well as the others so they could consider removing them. Additionally, they can quickly tell which items are the least ordered and most ordered to make sure they have it on stock.</p></li>
              </ul>
            </div>
          </ul>
        </div>
      </ul>
    </div>
    <br>
    <h6 class="center-align">You are currently logged out.</h6>
    <p class="center-align">Please login to check your company's items.</p>`;
}

// Setup materialize components
document.addEventListener('DOMContentLoaded', function () {
  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);
});
