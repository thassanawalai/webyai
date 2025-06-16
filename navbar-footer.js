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
// ตัวแปรสำหรับระบบเลือกค่าสายตา
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
// อัพเดทตะกร้าเมื่อโหลดหน้า
updateCartBadge();
// เปิด Modal สำหรับตาขวา
if(rightEyeBtn) rightEyeBtn.addEventListener('click', function() {
  currentEye = 'right';
  modalTitle.textContent = 'เลือกค่าสายตา - ตาขวา';
  modal.style.display = 'block';
  selectedValue = rightEyeSelected.textContent === 'ยังไม่ได้เลือก' ? '' : rightEyeSelected.textContent;
  updateSelectionDisplay();
});
// เปิด Modal สำหรับตาซ้าย
if(leftEyeBtn) leftEyeBtn.addEventListener('click', function() {
  currentEye = 'left';
  modalTitle.textContent = 'เลือกค่าสายตา - ตาซ้าย';
  modal.style.display = 'block';
  selectedValue = leftEyeSelected.textContent === 'ยังไม่ได้เลือก' ? '' : leftEyeSelected.textContent;
  updateSelectionDisplay();
});
// ปิด Modal
if(closeBtn) closeBtn.addEventListener('click', function() {
  modal.style.display = 'none';
});
// คลิกนอก Modal เพื่อปิด
window.addEventListener('click', function(event) {
  if (event.target === modal) modal.style.display = 'none';
  if (event.target.classList.contains('cart-modal')) closeCartModal();
  if (event.target.classList.contains('modal')) closeOrderHistoryModal && closeOrderHistoryModal();
});
// สลับระหว่าง MINUS และ PLUS
if(minusBtn) minusBtn.addEventListener('click', function() {
  minusBtn.classList.add('active');
  plusBtn.classList.remove('active');
  minusPrescription.style.display = 'block';
  plusPrescription.style.display = 'none';
});
if(plusBtn) plusBtn.addEventListener('click', function() {
  plusBtn.classList.add('active');
  minusBtn.classList.remove('active');
  minusPrescription.style.display = 'none';
  plusPrescription.style.display = 'block';
});
// เลือกค่าสายตา
if(document.querySelectorAll('.prescription-grid td').length) {
  document.querySelectorAll('.prescription-grid td').forEach(cell => {
    cell.addEventListener('click', function() {
      selectedValue = this.textContent;
      updateSelectionDisplay();
    });
  });
}
// ยืนยันการเลือก
if(confirmSelection) confirmSelection.addEventListener('click', function() {
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

// ฟังก์ชันสำหรับ bind event หลัง navbar โหลดเสร็จ
function bindPrescriptionAndProfileEvents() {
  // ตัวแปร prescription modal
  const rightEyeBtn = document.getElementById('rightEyeBtn');
  const leftEyeBtn = document.getElementById('leftEyeBtn');
  const rightEyeSelected = document.getElementById('rightEyeSelected');
  const leftEyeSelected = document.getElementById('leftEyeSelected');
  const rightEyeValue = document.getElementById('rightEyeValue');
  const leftEyeValue = document.getElementById('leftEyeValue');
  const modal = document.getElementById('prescriptionModal');
  const closeBtn = modal ? modal.querySelector('.close-btn') : null;
  const modalTitle = document.getElementById('modalTitle');
  const minusBtn = document.getElementById('minusBtn');
  const plusBtn = document.getElementById('plusBtn');
  const minusPrescription = document.getElementById('minusPrescription');
  const plusPrescription = document.getElementById('plusPrescription');
  const currentSelection = document.getElementById('currentSelection');
  const confirmSelection = document.getElementById('confirmSelection');
  const totalPriceElement = document.getElementById('totalPrice');

  // เปิด Modal สำหรับตาขวา
  if (rightEyeBtn) rightEyeBtn.onclick = function() {
    currentEye = 'right';
    if (modalTitle) modalTitle.textContent = 'เลือกค่าสายตา - ตาขวา';
    if (modal) modal.style.display = 'block';
    if (rightEyeSelected) selectedValue = rightEyeSelected.textContent === 'ยังไม่ได้เลือก' ? '' : rightEyeSelected.textContent;
    updateSelectionDisplay();
  };
  // เปิด Modal สำหรับตาซ้าย
  if (leftEyeBtn) leftEyeBtn.onclick = function() {
    currentEye = 'left';
    if (modalTitle) modalTitle.textContent = 'เลือกค่าสายตา - ตาซ้าย';
    if (modal) modal.style.display = 'block';
    if (leftEyeSelected) selectedValue = leftEyeSelected.textContent === 'ยังไม่ได้เลือก' ? '' : leftEyeSelected.textContent;
    updateSelectionDisplay();
  };
  // ปิด Modal
  if (closeBtn && modal) closeBtn.onclick = function() { modal.style.display = 'none'; };
  // คลิกนอก Modal เพื่อปิด
  window.addEventListener('click', function(event) {
    if (event.target === modal) modal.style.display = 'none';
    if (event.target.classList.contains('cart-modal')) closeCartModal();
  });
  // สลับระหว่าง MINUS และ PLUS
  if (minusBtn && plusBtn && minusPrescription && plusPrescription) {
    minusBtn.onclick = function() {
      minusBtn.classList.add('active');
      plusBtn.classList.remove('active');
      minusPrescription.style.display = 'block';
      plusPrescription.style.display = 'none';
    };
    plusBtn.onclick = function() {
      plusBtn.classList.add('active');
      minusBtn.classList.remove('active');
      minusPrescription.style.display = 'none';
      plusPrescription.style.display = 'block';
    };
  }
  // เลือกค่าสายตา
  if (modal) {
    modal.querySelectorAll('.prescription-grid td').forEach(cell => {
      cell.onclick = function() {
        selectedValue = this.textContent;
        updateSelectionDisplay();
      };
    });
  }
  // ยืนยันการเลือก
  if (confirmSelection) confirmSelection.onclick = function() {
    if (selectedValue) {
      if (currentEye === 'right' && rightEyeSelected && rightEyeValue) {
        rightEyeSelected.textContent = selectedValue;
        rightEyeValue.style.display = 'block';
      } else if (leftEyeSelected && leftEyeValue) {
        leftEyeSelected.textContent = selectedValue;
        leftEyeValue.style.display = 'block';
      }
      if (modal) modal.style.display = 'none';
      calculateTotal();
    } else {
      showNotification('กรุณาเลือกค่าสายตาก่อน', 'error');
    }
  };
  // Profile button
  const profile = document.querySelector('.profile');
  if (profile) {
    profile.onclick = function(event) {
      event.stopPropagation();
      let user = null;
      try { user = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) {}
      if (!user || !user.fullName) {
        showNotification('กำลังนำคุณไปยังหน้าเข้าสู่ระบบ', 'success');
        setTimeout(function() {
          window.location.href = 'buyer-login.html';
        }, 1200);
        return;
      }
      document.getElementById('dropdownMenu')?.classList.toggle('show');
    };
  }
  // ฟังก์ชันอัพเดทการแสดงผลค่าที่เลือก
  function updateSelectionDisplay() {
    if (currentSelection) {
      currentSelection.textContent = selectedValue || 'ยังไม่ได้เลือก';
    }
  }
  // ฟังก์ชันคำนวณราคารวม
  function calculateTotal() {
    if (rightEyeSelected && leftEyeSelected && totalPriceElement) {
      if (rightEyeSelected.textContent !== 'ยังไม่ได้เลือก' && leftEyeSelected.textContent !== 'ยังไม่ได้เลือก') {
        totalPriceElement.textContent = `${(parseFloat(rightEyeSelected.textContent) + parseFloat(leftEyeSelected.textContent)) * 700} บาท`;
      } else {
        totalPriceElement.textContent = 'XXX บาท';
      }
    }
  }
}
// เรียก bind หลัง navbar โหลด (delay เล็กน้อยให้ DOM มี navbar แล้ว)
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    const profile = document.querySelector('.profile');
    if (profile) profile.removeAttribute('onclick');
    bindPrescriptionAndProfileEvents();
  }, 300);
});