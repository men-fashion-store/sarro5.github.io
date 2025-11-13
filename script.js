// =======================================================
// 1. الإعدادات والتهيئة (يجب تغيير هذه القيم من لوحة تحكم Firebase)
// =======================================================
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

// الحصول على العناصر من الواجهة (HTML)
const orderForm = document.getElementById('order-form');
const orderNumberDisplay = document.getElementById('order-number-display');
const currentStatus = document.getElementById('current-status');


// =======================================================
// 2. معالجة إرسال النموذج (Form Submission)
// =======================================================
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderDetails = document.getElementById('order-details').value;
    const phoneNumber = document.getElementById('phone-number').value;
    
    if (!orderDetails || !phoneNumber) return alert("الرجاء ملء جميع الحقول.");

    try {
        // إنشاء الطلب في قاعدة البيانات
        const docRef = await db.collection("orders").add({
            details: orderDetails,
            phone: phoneNumber,
            status: "جديد - قيد المراجعة", 
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. عرض رقم الطلب وبدء تتبع حالته
        const orderId = docRef.id.substring(0, 8); 
        
        orderNumberDisplay.textContent = `رقم الطلب: ${orderId}`;
        currentStatus.textContent = "تم إرسال طلبك بنجاح. قيد المراجعة...";
        
        // بدء تتبع الحالة في الوقت الفعلي
        trackOrderStatus(docRef.id);

        orderForm.reset(); 
        alert(`تم استلام طلبك! رقم التتبع: ${orderId}`);
        
    } catch (error) {
        console.error("خطأ في إرسال الطلب: ", error);
        alert("حدث خطأ أثناء إرسال الطلب. تحقق من إعدادات Firebase.");
    }
});


// =======================================================
// 4. وظيفة تتبع حالة الطلب (Real-Time Tracking)
// =======================================================
function trackOrderStatus(docId) {
    // مراقبة المستند المحدد في قاعدة البيانات
    db.collection("orders").doc(docId).onSnapshot((doc) => {
        if (doc.exists) {
            const status = doc.data().status;
            
            // تحديث الواجهة فوراً
            currentStatus.textContent = `الحالة الحالية: ${status}`;

            // تنسيق بسيط حسب الحالة
            if (status.includes("في الطريق")) {
                currentStatus.style.backgroundColor = 'yellow';
                currentStatus.style.color = 'black';
            } else if (status.includes("قيد التجهيز")) {
                currentStatus.style.backgroundColor = 'lightblue';
            } else if (status.includes("جديد")) {
                currentStatus.style.backgroundColor = '#e9f7ef';
            }
            // ملاحظة: المالك هو من سيغير هذه الحالة يدوياً في Firebase
        }
    });
}