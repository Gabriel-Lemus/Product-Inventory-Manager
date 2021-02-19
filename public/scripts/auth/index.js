// DOM elements
const itemList = document.querySelector('.items');

// Setup Items
function setupItems(data) {
  if (data.length) {
    let html = '';
    data.forEach((doc) => {
      const item = doc.data();
      const li = `
      <li>
        <div class="collapsible-header grey lighten-4"> ${item.itemName} </div>
        <div class="collapsible-body white"> Amount: ${item.quantity} </div>
      </li>
    `;
      html += li;
    });
    itemList.innerHTML = html;
  } else {
    itemList.innerHTML = `
    <h5>About this project:</h5>
    <p>This is webapp is aimed to allow users to manage thier inventories and create alerts whenever they will perish or be depleted.</p>
    <br>
    <h6 style="text-align: center">You are currently logged out. Please login to see your companies\' items</h6>`;
  }
}

// Setup materialize components
document.addEventListener('DOMContentLoaded', function () {
  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);
});
