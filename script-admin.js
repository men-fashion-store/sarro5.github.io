// **إعدادات Firebase - نفس إعدادات script.js**
const firebaseConfig = {
  apiKey: "AIzaSyAis4G-tc2NkT9nrn4VpB39mDVqPILqTpA",
  authDomain: "saroo5-ab72a.firebaseapp.com",
  projectId: "saroo5-ab72a",
  storageBucket: "saroo5-ab72a.firebasestorage.app",
  messagingSenderId: "265152576253",
  appId: "1:265152576253:web:38d3104acc701b3fd19c94",
  measurementId: "G-HC4G1LQSEY"
};

// تهيئة تطبيق Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); 

const ordersList = document.getElementById('orders-list');

// 1. وظيفة لجلب الطلبات وعرضها في الوقت الفعلي
function fetchOrders() {
    // جلب الطلبات التي حالتها ليست 'تم التوصيل'
    db.collection("orders")
        .where("status", "!=", "تم التوصيل")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
            ordersList.innerHTML = ''; 

            if (snapshot.empty) {
                ordersList.innerHTML = '<p style="text-align: center; color: #777;">لا توجد طلبات جديدة حالياً.</p>';
                return;
            }

            snapshot.forEach((doc) => {
                const order = doc.data();
                const orderId = doc.id;
                
                const card = document.createElement('div');
                card.className = 'order-card';
                card.id = `order-${orderId}`;

                card.innerHTML = `
                    <div class="order-details">
                        <h4>رقم الطلب: ${orderId.substring(0, 8)}</h4>
                        <p><strong>الهاتف:</strong> ${order.phone}</p>
                        <p><strong>التفاصيل:</strong> ${order.details}</p>
                        <p><strong>الحالة:</strong> <span class="current-status">${order.status}</span></p>
                        <p><strong>الوقت:</strong> ${order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString('ar-EG') : 'غير محدد'}</p>
                    </div>
                    <div class="order-actions">
                        <button class="btn-action btn-prepare" data-id="${orderId}" data-status="قيد التجهيز">تجهيز</button>
                        <button class="btn-action btn-deliver" data-id="${orderId}" data-status="في الطريق">توصيل</button>
                        <button class="btn-action btn-done" data-id="${orderId}" data-status="تم التوصيل">اكتمل</button>
                    </div>
                `;

                ordersList.appendChild(card);
            });
            
            attachEventListeners();
        }, (error) => {
            console.error("Error fetching orders:", error);
            ordersList.innerHTML = '<p style="text-align: center; color: red;">خطأ في تحميل الطلبات. تحقق من إعدادات Firebase.</p>';
        });
}

// 2. وظيفة لتغيير حالة الطلب
function updateOrderStatus(orderId, newStatus) {
    db.collection("orders").doc(orderId).update({
        status: newStatus
    })
    .then(() => {
        console.log("تم تحديث حالة الطلب بنجاح إلى:", newStatus);
        alert(`تم تغيير حالة الطلب إلى: ${newStatus}`);
    })
    .catch((error) => {
        console.error("خطأ في تحديث الحالة:", error);
        alert("حدث خطأ في التحديث. تحقق من اتصالك.");
    });
}

// 3. إضافة مستمعي الأحداث
function attachEventListeners() {
    document.querySelectorAll('.btn-action').forEach(button => {
        button.addEventListener('click', (e) => {
            const orderId = e.target.getAttribute('data-id');
            const newStatus = e.target.getAttribute('data-status');
            
            if (confirm(`هل أنت متأكد من تغيير حالة الطلب ${orderId.substring(0, 8)} إلى: ${newStatus}؟`)) {
                updateOrderStatus(orderId, newStatus);
            }
        });
    });
}

// البدء بجلب الطلبات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchOrders);