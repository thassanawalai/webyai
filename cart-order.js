// ระบบตะกร้าสินค้า, prescription, และ order modal สำหรับ buyer-dashboard.html

// ตัวแปรสำหรับระบบตะกร้าสินค้า
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById('cartBadge');

// ฟังก์ชันสำหรับตะกร้าสินค้า
function addToCart() {
  if (rightEyeSelected.textContent === 'ยังไม่ได้เลือก' || 
      leftEyeSelected.textContent === 'ยังไม่ได้เลือก') {
    showNotification('กรุณาเลือกค่าสายตาทั้งสองข้างก่อน');
    return;
  }
  const newProduct = {
    id: Date.now(),
    name: 'Alice Moist Daily เลนส์สัมผัสรายวัน',
    price: 700,
    image: 'images/product1.png',
    rightEye: rightEyeSelected.textContent,
    leftEye: leftEyeSelected.textContent,
    quantity: 1,
    timestamp: new Date().toISOString()
  };
  const existingItemIndex = cart.findIndex(item => 
    item.name === newProduct.name &&
    item.rightEye === newProduct.rightEye &&
    item.leftEye === newProduct.leftEye
  );
  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push(newProduct);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showNotification('เพิ่มสินค้าในตะกร้าเรียบร้อยแล้ว', 'success');
}

function updateQuantity(itemId, change) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity < 1) cart[itemIndex].quantity = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    openCartModal();
  }
}

function updateCartBadge() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItems;
}

function buyNow() {
  if (rightEyeSelected.textContent === 'ยังไม่ได้เลือก' || 
      leftEyeSelected.textContent === 'ยังไม่ได้เลือก') {
    showNotification('กรุณาเลือกค่าสายตาทั้งสองข้างก่อน');
    return;
  }
  addToCart();
  openCartModal();
}

function openCartModal() {
  const cartModal = document.getElementById('cartModal');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const loginAlert = document.getElementById('loginAlert');
  cartItemsContainer.innerHTML = '';
  let total = 0;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>ไม่มีสินค้าในตะกร้า</h3>
        <p>กรุณาเพิ่มสินค้าในตะกร้าก่อน</p>
      </div>
    `;
    cartTotalPrice.textContent = '0 บาท';
    loginAlert.style.display = 'none';
  } else {
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-prescription">
            ตาขวา: ${item.rightEye || 'N/A'}, ตาซ้าย: ${item.leftEye || 'N/A'}
          </div>
          <div class="cart-item-price">${item.price} บาท × ${item.quantity} = ${itemTotal} บาท</div>
          <div class="quantity-controls">
            <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    cartTotalPrice.textContent = `${total} บาท`;
    loginAlert.style.display = localStorage.getItem('registeredUsername') ? 'none' : 'block';
  }
  cartModal.style.display = 'block';
}

function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    openCartModal();
    updateCartBadge();
  }
}

function checkout() {
  if (cart.length === 0) {
    showNotification('ไม่มีสินค้าในตะกร้า', 'error');
    return;
  }
  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem('currentUser'));
  } catch (e) {}
  if (!user || !user.fullName) {
    closeCartModal();
    window.location.href = 'buyer-login.html';
    return;
  }
  showNotification('กำลังนำคุณไปยังหน้าชำระเงิน', 'success');
  setTimeout(() => {
    window.location.href = "buyer-checkout.html";
  }, 1500);
}

// ระบบ prescription modal
let currentEye = '';
let selectedValue = '';
const rightEyeBtn = document.getElementById('rightEyeBtn');
const leftEyeBtn = document.getElementById('leftEyeBtn');
const rightEyeSelected = document.getElementById('rightEyeSelected');
const leftEyeSelected = document.getElementById('leftEyeSelected');
const rightEyeValue = document.getElementById('rightEyeValue');
const leftEyeValue = document.getElementById('leftEyeValue');
const modal = document.getElementById('prescriptionModal');
const closeBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modalTitle');
const minusBtn = document.getElementById('minusBtn');
const plusBtn = document.getElementById('plusBtn');
const minusPrescription = document.getElementById('minusPrescription');
const plusPrescription = document.getElementById('plusPrescription');
const currentSelection = document.getElementById('currentSelection');
const confirmSelection = document.getElementById('confirmSelection');
const totalPriceElement = document.getElementById('totalPrice');

rightEyeBtn.addEventListener('click', function() {
  currentEye = 'right';
  modalTitle.textContent = 'เลือกค่าสายตา - ตาขวา';
  modal.style.display = 'block';
  selectedValue = rightEyeSelected.textContent === 'ยังไม่ได้เลือก' ? '' : rightEyeSelected.textContent;
  updateSelectionDisplay();
});
leftEyeBtn.addEventListener('click', function() {
  currentEye = 'left';
  modalTitle.textContent = 'เลือกค่าสายตา - ตาซ้าย';
  modal.style.display = 'block';
  selectedValue = leftEyeSelected.textContent === 'ยังไม่ได้เลือก' ? '' : leftEyeSelected.textContent;
  updateSelectionDisplay();
});
closeBtn.addEventListener('click', function() {
  modal.style.display = 'none';
});
window.addEventListener('click', function(event) {
  if (event.target === modal) modal.style.display = 'none';
  if (event.target.classList.contains('cart-modal')) closeCartModal();
  if (event.target.classList.contains('auth-modal')) closeAuthModal && closeAuthModal();
  if (event.target.classList.contains('modal')) closeOrderHistoryModal && closeOrderHistoryModal();
});
minusBtn.addEventListener('click', function() {
  minusBtn.classList.add('active');
  plusBtn.classList.remove('active');
  minusPrescription.style.display = 'block';
  plusPrescription.style.display = 'none';
});
plusBtn.addEventListener('click', function() {
  plusBtn.classList.add('active');
  minusBtn.classList.remove('active');
  minusPrescription.style.display = 'none';
  plusPrescription.style.display = 'block';
});
document.querySelectorAll('.prescription-grid td').forEach(cell => {
  cell.addEventListener('click', function() {
    selectedValue = this.textContent;
    updateSelectionDisplay();
  });
});
confirmSelection.addEventListener('click', function() {
  if (selectedValue) {
    if (currentEye === 'right') {
      rightEyeSelected.textContent = selectedValue;
      rightEyeValue.style.display = 'block';
    } else {
      leftEyeSelected.textContent = selectedValue;
      leftEyeValue.style.display = 'block';
    }
    modal.style.display = 'none';
    calculateTotal();
  } else {
    showNotification('กรุณาเลือกค่าสายตาก่อน', 'error');
  }
});
function updateSelectionDisplay() {
  if (selectedValue) {
    currentSelection.textContent = selectedValue;
  } else {
    currentSelection.textContent = 'ยังไม่ได้เลือก';
  }
}
function calculateTotal() {
  if (rightEyeSelected.textContent !== 'ยังไม่ได้เลือก' && 
      leftEyeSelected.textContent !== 'ยังไม่ได้เลือก') {
    totalPriceElement.textContent = `${(parseFloat(rightEyeSelected.textContent) + parseFloat(leftEyeSelected.textContent)) * 700} บาท`;
  } else {
    totalPriceElement.textContent = 'XXX บาท';
  }
}
// อัพเดทตะกร้าเมื่อโหลดหน้า
updateCartBadge();
// END
