// --- ระบบตะกร้าสินค้า (Cart) ---
window.addEventListener('DOMContentLoaded', function() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartBadge = document.getElementById('cartBadge');

  window.addToCart = function(product) {
    let rightEye = '', leftEye = '', quantity = 1;
    if (product && typeof product === 'object') {
      rightEye = product.rightEye || '';
      leftEye = product.leftEye || '';
      quantity = product.quantity || 1;
    } else if (typeof rightEyeSelected !== 'undefined' && rightEyeSelected && typeof leftEyeSelected !== 'undefined' && leftEyeSelected) {
      if (rightEyeSelected.textContent === 'ยังไม่ได้เลือก' || leftEyeSelected.textContent === 'ยังไม่ได้เลือก') {
        showNotification('กรุณาเลือกค่าสายตาทั้งสองข้างก่อน');
        return;
      }
      rightEye = rightEyeSelected.textContent;
      leftEye = leftEyeSelected.textContent;
    }
    let price = 700;
    if (quantity === 2) price = 1300;
    else if (quantity === 4) price = 2400;
    const newProduct = {
      id: Date.now(),
      name: (product && product.name) ? product.name : 'Alice Moist Daily เลนส์สัมผัสรายวัน',
      price: price,
      image: 'images/product1.png',
      rightEye: rightEye,
      leftEye: leftEye,
      quantity: quantity,
      timestamp: new Date().toISOString()
    };
    const existingItemIndex = cart.findIndex(item => 
      item.name === newProduct.name &&
      item.rightEye === newProduct.rightEye &&
      item.leftEye === newProduct.leftEye &&
      item.price === newProduct.price
    );
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(newProduct);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification('เพิ่มสินค้าในตะกร้าเรียบร้อยแล้ว', 'success');
  }

  window.updateQuantity = function(itemId, change) {
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

  window.buyNow = function() {
    if (typeof rightEyeSelected !== 'undefined' && rightEyeSelected && typeof leftEyeSelected !== 'undefined' && leftEyeSelected) {
      if (rightEyeSelected.textContent === 'ยังไม่ได้เลือก' || leftEyeSelected.textContent === 'ยังไม่ได้เลือก') {
        showNotification('กรุณาเลือกค่าสายตาทั้งสองข้างก่อน');
        return;
      }
    }
    addToCart();
    showNotification('เพิ่มสินค้าในตะกร้าเรียบร้อยแล้ว', 'success');
    openCartModal();
  }

  window.openCartModal = function() {
    const cartModal = document.getElementById('cartModal');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const loginAlert = document.getElementById('loginAlert');
    if (!cartModal || !cartItemsContainer || !cartTotalPrice || !loginAlert) {
      console.error('Cart modal elements not found in DOM');
      return;
    }
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
    cartModal.classList.add('show');
    const overlay = document.querySelector('.cart-modal-overlay');
    if (overlay) overlay.classList.add('show');
  }

  window.closeCartModal = function() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.remove('show');
    const overlay = document.querySelector('.cart-modal-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  window.removeFromCart = function(id) {
    const index = cart.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      openCartModal();
      updateCartBadge();
      showNotification('ลบสินค้าออกจากตะกร้าแล้ว', 'success');
    } else {
      showNotification('ไม่พบสินค้านี้ในตะกร้า', 'error');
    }
  }

  window.checkout = function() {
    if (cart.length === 0) {
      showNotification('ไม่มีสินค้าในตะกร้า', 'error');
      return;
    }
    showNotification('กำลังนำคุณไปยังหน้าชำระเงิน', 'success');
    setTimeout(() => {
      window.location.href = "buyer-checkout.html";
    }, 1500);
  }

  updateCartBadge();
});
window.bindPrescriptionAndProfileEvents = function() {};
// โหลด navbar และ footer อัตโนมัติ (ใช้ในทุกหน้า)
(function() {
  function loadHTML(id, file) {
    fetch(file)
      .then(r => r.text())
      .then(t => { document.getElementById(id).innerHTML = t; })
      .catch(() => {});
  }
  if (!document.getElementById('navbar')) {
    var navDiv = document.createElement('div');
    navDiv.id = 'navbar';
    if (document.body && document.body.firstChild) {
      document.body.insertBefore(navDiv, document.body.firstChild);
    } else if (document.body) {
      document.body.appendChild(navDiv);
    }
  }
  if (!document.getElementById('footer')) {
    var footDiv = document.createElement('div');
    footDiv.id = 'footer';
    if (document.body) {
      document.body.appendChild(footDiv);
    } // else: do nothing if body is not ready
  }
  loadHTML('navbar', 'navbar.html');
  loadHTML('footer', 'footer.html');
})();

// ฟังก์ชัน navbar/footer ที่ต้องใช้ทุกหน้า (copy จาก dashboard)
function goHome() { window.location.href = "buyer-dashboard.html"; }
function setAccount() { window.location.href = "buyer-setting.html"; }
function openOrderHistoryModal() {
  var modal = document.getElementById('orderHistoryModal');
  if (modal) { modal.style.display = 'block'; }
}
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('registeredUsername');
  localStorage.removeItem('registeredEmail');
  localStorage.removeItem('registeredPassword');
  localStorage.removeItem('cart');
  if (typeof updateCartBadge === 'function') updateCartBadge();
  const dropdown = document.getElementById('dropdownMenu');
  if (dropdown) dropdown.classList.remove('show');
  sessionStorage.removeItem('currentUser');
  if (typeof showNotification === 'function') showNotification('ออกจากระบบสำเร็จ', 'success');
  if (typeof updateUserUI === 'function') updateUserUI();
}

// ปรับให้คลิก .username-display เปิด/ปิด dropdown เสมอ (ไม่ redirect ถ้า login แล้ว)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Bind profile dropdown click
    const usernameDisplay = document.querySelector('.username-display');
    if (usernameDisplay) {
      usernameDisplay.onclick = function(event) {
        event.stopPropagation();
        let user = null;
        try { user = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) {}
        if (!user || !user.fullName) {
          window.location.href = 'buyer-login.html';
          return;
        }
        document.getElementById('dropdownMenu')?.classList.toggle('show');
      };
    }
    bindPrescriptionAndProfileEvents();
  }, 300);
});

function toggleDropdown(event) {
  event.stopPropagation();
  let user = null;
  try { user = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) {}
  if (!user || !user.fullName) {
    window.location.href = 'buyer-login.html';
    return;
  }
  document.getElementById('dropdownMenu')?.classList.toggle("show");
}
document.addEventListener("click", function (event) {
  if (!event.target.closest(".profile")) {
    document.getElementById('dropdownMenu')?.classList.remove("show");
  }
});
function toggleMobileMenu() {
  document.getElementById('hamburger')?.classList.toggle("active");
  document.getElementById('mobileMenu')?.classList.toggle("show");
  document.getElementById('overlay')?.classList.toggle("show");
}
// ฟังก์ชันอัพเดท UI หลังจากล็อกอิน
function updateUserUI() {
  // พยายามอัปเดตทันที ถ้า element ยังไม่เจอ ให้ retry ซ้ำ (เร็วขึ้น)
  let retry = 0;
  function tryUpdate() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const dropdownUsername = document.getElementById('dropdownUsername');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const dropdown = document.getElementById('dropdownMenu');
    let user = null;
    try {
      user = JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {}
    if (usernameDisplay && dropdownUsername && dropdownEmail) {
      if (user && user.fullName) {
        usernameDisplay.textContent = user.fullName;
        dropdownUsername.textContent = user.fullName;
        dropdownEmail.textContent = user.email;
        if (dropdown) dropdown.classList.remove('show');
      } else {
        usernameDisplay.textContent = 'ล็อกอิน';
        dropdownUsername.textContent = 'ผู้ใช้งาน';
        dropdownEmail.textContent = 'example@email.com';
        if (dropdown) dropdown.classList.remove('show');
      }
      if (typeof updateCartBadge === 'function') updateCartBadge();
    } else if (retry < 10) {
      // ถ้ายังไม่เจอ element ให้ retry ทุก 50ms (สูงสุด 10 ครั้ง)
      retry++;
      setTimeout(tryUpdate, 50);
    }
  }
  tryUpdate();
}

// ฟังก์ชันแสดงการแจ้งเตือน
function showNotification(message, type) {
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  else if (type === 'error') icon = 'fa-times-circle';
  else if (type === 'warning') icon = 'fa-exclamation-triangle';
  // info is default

  const notification = document.createElement('div');
  notification.className = `notification ${type || 'info'}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hide');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 1800);
}

// เพิ่มการคลิกที่แท็บ
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    // ลบ active จากแท็บทั้งหมด
    document.querySelectorAll('.auth-tab').forEach(t => {
      t.classList.remove('active');
    });
    
    // เพิ่ม active ให้แท็บที่คลิก
    this.classList.add('active');
    
    // ซ่อนฟอร์มทั้งหมด
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    
    // แสดงฟอร์มที่ตรงกับแท็บ
    const tabId = this.dataset.tab;
    document.getElementById(`${tabId}Form`).classList.add('active');
  });
});

// อัพเดท UI เมื่อโหลดหน้า (เร็วขึ้น)
window.addEventListener('DOMContentLoaded', function() {
  updateUserUI();
});

// ตัวแปรสำหรับระบบประวัติการสั่งซื้อ
let orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
let filteredOrders = [];
const ordersPerPage = 4;
let currentPage = 1;

// ฟังก์ชันเปิด modal ประวัติการสั่งซื้อ
function openOrderHistoryModal() {
  // อ่านข้อมูลใหม่จาก localStorage ทุกครั้ง
  orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
  filteredOrders = [...orders];

  const modal = document.getElementById('orderHistoryModal');
  modal.style.display = 'block';
  
  // เรียกฟังก์ชันแสดงประวัติใหม่
  displayOrderHistory();
  
  // สร้าง pagination
  generatePagination();
  
  document.body.style.overflow = 'hidden';
}

// ฟังก์ชันปิด modal
function closeOrderHistoryModal() {
  document.getElementById('orderHistoryModal').style.display = 'none';
  
  // คืนค่าการสกรอลของ body
  document.body.style.overflow = 'auto';
}

// ฟังก์ชันกรองคำสั่งซื้อตามสถานะ
function filterOrders() {
  const status = document.getElementById('statusFilter').value;
  
  if (status === 'all') {
    filteredOrders = [...orders];
  } else {
    filteredOrders = orders.filter(order => order.status === status);
  }
  
  currentPage = 1;
  displayOrderHistory();
  generatePagination();
}

// ฟังก์ชันเรียงลำดับคำสั่งซื้อ
function sortOrders() {
  const sortBy = document.getElementById('sortOrder').value;
  
  filteredOrders.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'price-high') {
      return b.total - a.total;
    } else if (sortBy === 'price-low') {
      return a.total - b.total;
    }
    return 0;
  });
  
  currentPage = 1;
  displayOrderHistory();
  generatePagination();
}

// ฟังก์ชันค้นหาคำสั่งซื้อ
function searchOrders() {
  const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
  
  if (!searchTerm) {
    filteredOrders = [...orders];
  } else {
    filteredOrders = orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm) ||
      order.date.toLowerCase().includes(searchTerm)
    );
  }
  
  currentPage = 1;
  displayOrderHistory();
  generatePagination();
}

// ฟังก์ชันแสดงประวัติการสั่งซื้อ
function displayOrderHistory() {
  const container = document.getElementById('orderHistoryContainer');
  
  // ตรวจสอบว่ามีคำสั่งซื้อหรือไม่
  if (filteredOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-orders">
        <i class="fas fa-box-open"></i>
        <h3>ไม่พบประวัติการสั่งซื้อ</h3>
        <p>คุณยังไม่ได้ทำการสั่งซื้อสินค้าใด ๆ</p>
      </div>
    `;
    return;
  }
  
  // คำนวณคำสั่งซื้อที่จะแสดงในหน้าปัจจุบัน
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const ordersToShow = filteredOrders.slice(startIndex, endIndex);
  
  let html = '';
  
  ordersToShow.forEach(order => {
    // สร้างรายการสินค้า
    let productsHtml = '';
    order.items.forEach(item => {
      productsHtml += `
        <div class="order-product-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="order-product-details">
            <div class="order-product-title">${item.name}</div>
            <div class="order-product-prescription">
              ตาขวา: ${item.rightEye || 'N/A'}, ตาซ้าย: ${item.leftEye || 'N/A'}
            </div>
            <div class="order-product-price">
              ${item.quantity} × ${item.price} บาท = ${item.quantity * item.price} บาท
            </div>
          </div>
        </div>
      `;
    });
  
    // สร้างสถานะ
    let statusHtml = '';
    let statusClass = 'status-pending';
    let statusText = 'รอดำเนินการ';
    
    if (order.status) {

      switch (order.status) {
        case 'all':
          statusClass = 'status-all';
          statusText = 'ทั้งหมด';
          break;
        case 'pending':
          statusClass = 'status-pending';
          statusText = 'รอดำเนินการ';
          break;
        case 'processing':
          statusClass = 'status-processing';
          statusText = 'กำลังเตรียมสินค้า';
          break;
        case 'shipped':
          statusClass = 'status-shipped';
          statusText = 'จัดส่งแล้ว';
          break;
        case 'delivered':
          statusClass = 'status-delivered';
          statusText = 'จัดส่งสำเร็จ';
          break;
        case 'cancelled':
          statusClass = 'status-cancelled';
          statusText = 'ยกเลิก';
          break;
      }
    } else {
      // สำหรับข้อมูลเดิมที่ไม่มีสถานะ
      const orderDate = new Date(order.date);
      const daysAgo = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      
      if (daysAgo > 7) {
        statusClass = 'status-delivered';
        statusText = 'จัดส่งสำเร็จ';
      } else if (daysAgo > 3) {
        statusClass = 'status-shipped';
        statusText = 'จัดส่งแล้ว';
      } else if (daysAgo > 1) {
        statusClass = 'status-processing';
        statusText = 'กำลังเตรียมสินค้า';
      }
    }
    
    statusHtml = `<span class="order-status ${statusClass}"><i class="fas fa-circle"></i> ${statusText}</span>`;
    
    const paymentMethod = getPaymentMethodName(order.payment);
  
    html += `
      <div class="order-item">
        <div class="order-header">
          <div>
            <div class="order-id">คำสั่งซื้อ #${order.id}</div>
            <div class="order-date">${order.date}</div>
          </div>
          ${statusHtml}
        </div>
        
        <div class="order-details">
          <div class="order-products">
            <div class="order-summary-title">รายการสินค้า</div>
            ${productsHtml}
          </div>
          
          <div class="order-summary">
            <div class="order-summary-title">สรุปการสั่งซื้อ</div>
            <div class="order-summary-row">
              <span>ยอดรวมสินค้า:</span>
              <span>${Number(order.subtotal).toFixed(2)} บาท</span>
            </div>
            <div class="order-summary-row">
              <span>ค่าจัดส่ง:</span>
              <span>${Number(order.shippingFee).toFixed(2)} บาท</span>
            </div>
            <div class="order-summary-row">
              <span>ส่วนลด:</span>
              <span>${Number(order.discount).toFixed(2)} บาท</span>
            </div>
            <div class="order-summary-row order-total">
              <span>ยอดชำระทั้งหมด:</span>
              <span>${Number(order.total).toFixed(2)} บาท</span>
            </div>
            
            <div class="order-payment">
              <div class="order-summary-title">วิธีการชำระเงิน</div>
              <p>${paymentMethod}</p>
            </div>
            
            <div class="order-address">
              <div class="order-summary-title">ที่อยู่จัดส่ง</div>
              <div class="address-details">
                <p>${order.address.name}</p>
                <p>${order.address.address}, ${order.address.district}</p>
                <p>${order.address.province} ${order.address.postalCode}</p>
                <p>${order.address.phone}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-actions">
          <button class="order-action-btn view-details" onclick="viewOrderDetails('${order.id}')">
            <i class="fas fa-eye"></i> ดูรายละเอียด
          </button>
          <button class="order-action-btn reorder" onclick="reorder('${order.id}')">
            <i class="fas fa-redo"></i> สั่งซื้ออีกครั้ง
          </button>
          <button class="order-action-btn delete-order" onclick="deleteOrder('${order.id}')">
            <i class="fas fa-trash"></i> ลบ
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ฟังก์ชันสร้าง pagination
function generatePagination() {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // ปุ่มก่อนหน้า
  if (currentPage > 1) {
    html += `<div class="page-btn" onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></div>`;
  }
  
  // ปุ่มหน้า
  for (let i = startPage; i <= endPage; i++) {
    html += `<div class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</div>`;
  }
  
  // ปุ่มถัดไป
  if (currentPage < totalPages) {
    html += `<div class="page-btn" onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></div>`;
  }
  
  pagination.innerHTML = html;
}

// ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  displayOrderHistory();
  generatePagination();
  document.getElementById('orderHistoryContainer').scrollTop = 0;
}

// ฟังก์ชันแปลงชื่อวิธีการชำระเงิน
function getPaymentMethodName(method) {
  switch(method) {
    case 'bank': return 'โอนเงินผ่านธนาคาร';
    case 'credit': return 'บัตรเครดิต/เดบิต';
    case 'promptpay': return 'พร้อมเพย์';
    case 'cod': return 'เก็บเงินปลายทาง (COD)';
    default: return method || 'ไม่ระบุ';
  }
}

// ฟังก์ชันดูรายละเอียดคำสั่งซื้อ
function viewOrderDetails(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    alert(`ดูรายละเอียดคำสั่งซื้อ #${orderId}\n\nสถานะ: ${getStatusText(order.status)}\nวันที่สั่งซื้อ: ${order.date}\nยอดรวม: ${order.total} บาท`);
  }
} 

// ฟังก์ชันสั่งซื้ออีกครั้ง
function reorder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    // เพิ่มสินค้าในตะกร้า
    cart = [...order.items];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // ปิด modal และเปิดตะกร้า
    closeOrderHistoryModal();
    openCartModal();
    
    showNotification('เพิ่มสินค้าในตะกร้าเรียบร้อยแล้ว', 'success');
  }
}

// ฟังก์ชันแปลงสถานะเป็นข้อความ
function getStatusText(status) {
  switch(status) {
    case 'pending': return 'รอดำเนินการ';
    case 'processing': return 'กำลังเตรียมสินค้า';
    case 'shipped': return 'จัดส่งแล้ว';
    case 'delivered': return 'จัดส่งสำเร็จ';
    case 'cancelled': return 'ยกเลิก';
    default: return 'ไม่ระบุ';
  }
}

// ฟังก์ชันลบคำสั่งซื้อ
function deleteOrder(orderId) {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการสั่งซื้อนี้?')) {
    const index = orders.findIndex(order => order.id === orderId);
    
    if (index !== -1) {
      orders.splice(index, 1);
      
      localStorage.setItem('orderHistory', JSON.stringify(orders));
      filteredOrders = orders.filter(order => order.id !== orderId);
      
      currentPage = 1;
      displayOrderHistory();
      generatePagination();
      
      showNotification('ลบรายการสั่งซื้อสำเร็จ', 'success');
    } else {
      showNotification('ไม่พบรายการสั่งซื้อที่ต้องการลบ', 'error');
    }
  }
}
// ==== เพิ่มฟังก์ชันระบบตะกร้าสินค้าและสินค้า (จาก dashboard) ====
// ตัวแปรสำหรับระบบตะกร้าสินค้า
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById('cartBadge');

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
  if(cartBadge) cartBadge.textContent = totalItems;
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
    if(loginAlert) loginAlert.style.display = 'none';
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
    if(loginAlert) loginAlert.style.display = localStorage.getItem('registeredUsername') ? 'none' : 'block';
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
  try { user = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) {}
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