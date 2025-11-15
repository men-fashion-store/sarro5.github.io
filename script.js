// =======================================================
// 1. الإعدادات والتهيئة
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
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// متغيرات للعناصر
let orderForm, orderNumberDisplay, currentStatus, phoneInput;

// =======================================================
// 2. وظيفة التحقق من صحة رقم الهاتف
// =======================================================
function validatePhoneNumber(phone) {
    // إزالة المسافات والشرطات
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    
    // التحقق من أن الرقم يحتوي على أرقام فقط
    if (!/^\d+$/.test(cleanPhone)) {
        return {
            isValid: false,
            message: "❌ رقم الهاتف يجب أن يحتوي على أرقام فقط، بدون حروف أو رموز."
        };
    }
    
    // التحقق من الطول (11 رقم للهواتف المصرية)
    if (cleanPhone.length !== 11) {
        return {
            isValid: false,
            message: "❌ رقم الهاتف يجب أن يكون 11 رقماً."
        };
    }
    
    // التحقق من أن الرقم يبدأ بـ 01 (للهواتف المصرية)
    if (!cleanPhone.startsWith('01')) {
        return {
            isValid: false,
            message: "❌ رقم الهاتف يجب أن يبدأ بـ 01."
        };
    }
    
    // التحقق من أن الرقم الثاني هو 0 أو 1 أو 2 أو 5
    const thirdDigit = cleanPhone.charAt(2);
    if (!['0', '1', '2', '5'].includes(thirdDigit)) {
        return {
            isValid: false,
            message: "❌ رقم هاتف غير صحيح. يجب أن يكون من شركات الاتصال في مصر."
        };
    }
    
    return {
        isValid: true,
        message: "✅ رقم الهاتف صحيح",
        cleanNumber: cleanPhone
    };
}

// =======================================================
// 3. إضافة تحقق أثناء الكتابة (Real-time validation)
// =======================================================
function setupPhoneValidation() {
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            const phone = e.target.value;
            const validation = validatePhoneNumber(phone);
            
            // تغيير لون الحقل حسب الصحة
            if (phone.length > 0) {
                if (validation.isValid) {
                    phoneInput.style.borderColor = '#28a745';
                    phoneInput.style.backgroundColor = '#f8fff9';
                } else {
                    phoneInput.style.borderColor = '#dc3545';
                    phoneInput.style.backgroundColor = '#fff5f5';
                }
            } else {
                // إعادة التنسيق إذا كان الحقل فارغاً
                phoneInput.style.borderColor = '#ccc';
                phoneInput.style.backgroundColor = '#fff';
            }
        });
    }
}

// =======================================================
// 4. معالجة إرسال النموذج (Form Submission)
// =======================================================
function setupOrderForm() {
    if (!orderForm || !db) {
        console.error('❌ Order form or database not initialized');
        return;
    }
    
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
    const customerName = document.getElementById('name').value.trim();
    const orderDetails = document.getElementById('order-details').value;
    const address = document.getElementById('address').value;
    const phoneNumber = document.getElementById('phone-number').value;
    
    // التحقق من الحقول الفارغة
        if (!customerName || !orderDetails || !address || !phoneNumber) {
            alert("⚠️ الرجاء ملء جميع الحقول.");
            return;
        }
    // التحقق من صحة رقم الهاتف
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
        alert(phoneValidation.message);
        phoneInput.focus();
        return;
    }

    try {
        // إظهار رسالة تحميل
        currentStatus.textContent = "جاري إرسال طلبك...";
        
        // إنشاء الطلب في قاعدة البيانات
        const docRef = await db.collection("orders").add({
                name: customerName,
                details: orderDetails,
                address: address,
                phone: phoneValidation.cleanNumber,
                status: "جديد - قيد المراجعة",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });


        // عرض رقم الطلب وبدء تتبع حالته
        // const orderId = docRef.id.substring(0, 8); 
        const orderId = phoneValidation.cleanNumber; 
        
        orderNumberDisplay.textContent = `رقم الطلب: ${orderId}`;
        currentStatus.textContent = "✅ تم إرسال طلبك بنجاح. قيد المراجعة...";
        currentStatus.style.backgroundColor = '#e9f7ef';
        currentStatus.style.color = '#155724';
        
        // بدء تتبع الحالة في الوقت الفعلي
        trackOrderStatus(docRef.id);

        // إعادة تعيين النموذج
        orderForm.reset();
        
        // إعادة تنسيق حقل الهاتف
        phoneInput.style.borderColor = '#ccc';
        phoneInput.style.backgroundColor = '#fff';
        
        // إظهار رسالة نجاح
        alert(`✅ تم استلام طلبك بنجاح!\nرقم التتبع: ${orderId}\nسنقوم بالاتصال بك على: ${phoneValidation.cleanNumber}`);
        
    } catch (error) {
        console.error("خطأ في إرسال الطلب: ", error);
        alert("❌ حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        currentStatus.textContent = "❌ فشل في إرسال الطلب. حاول مرة أخرى.";
        currentStatus.style.backgroundColor = '#f8d7da';
        currentStatus.style.color = '#721c24';
    }
    });
}

// =======================================================
// 5. وظيفة تتبع حالة الطلب (Real-Time Tracking)
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
                currentStatus.style.backgroundColor = '#fff3cd';
                currentStatus.style.color = '#856404';
            } else if (status.includes("قيد التجهيز")) {
                currentStatus.style.backgroundColor = '#cce7ff';
                currentStatus.style.color = '#004085';
            } else if (status.includes("جديد")) {
                currentStatus.style.backgroundColor = '#e9f7ef';
                currentStatus.style.color = '#155724';
            } else if (status.includes("تم التوصيل")) {
                currentStatus.style.backgroundColor = '#d4edda';
                currentStatus.style.color = '#155724';
            }
        }
    });
}

// =======================================================
// 6. وظيفة التحقق من حالة الطلب (Track Order)
// =======================================================
let trackOrderBtn, trackOrderInput, trackResult;

// دالة لتنظيف HTML ضد XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// تهيئة عناصر التحقق من الطلب
function setupTrackOrder() {
    trackOrderBtn = document.getElementById('track-order-btn');
    trackOrderInput = document.getElementById('track-order-number');
    trackResult = document.getElementById('track-result');
    
    if (trackOrderBtn && trackOrderInput && trackResult) {
        trackOrderBtn.addEventListener('click', handleTrackOrder);
        
        // السماح بالبحث عند الضغط على Enter
        trackOrderInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                trackOrderBtn.click();
            }
        });
    }
}

async function handleTrackOrder() {
    if (!trackOrderInput || !trackOrderBtn || !trackResult || !db) {
        console.error('❌ Track order elements or database not initialized');
        return;
    }
    
    const orderNumber = trackOrderInput.value.trim();
    
    if (!orderNumber) {
        showTrackResult('error', '⚠️ الرجاء إدخال رقم الطلب');
        return;
    }
    
    if (orderNumber.length !== 11) {
        showTrackResult('error', '❌ رقم الطلب يجب أن يكون مطابق لرقم الهاتف');
        return;
    }
    
    try {
        trackOrderBtn.disabled = true;
        trackOrderBtn.textContent = 'جاري البحث...';
        trackResult.style.display = 'block';
        trackResult.className = 'info';
        trackResult.innerHTML = '🔍 جاري البحث عن الطلب...';
        
        // البحث عن الطلب في قاعدة البيانات
        const ordersSnapshot = await db.collection('orders').get();
        let foundOrder = null;
        let foundOrderId = null;
        
        ordersSnapshot.forEach(doc => {
            const data = doc.data();
            // const orderId = doc.id;
            if ( data.phone === orderNumber) {
                foundOrder = data;
                foundOrderId = doc.id;
            }
        });
        // orderId.substring(0, 8)
        
        if (foundOrder) {
            const createdAt = foundOrder.createdAt ? 
                (foundOrder.createdAt.toDate ? new Date(foundOrder.createdAt.toDate()) : new Date(foundOrder.createdAt)) : 
                null;
            
            const statusColor = getStatusColorForTrack(foundOrder.status);
            
            // تنظيف جميع البيانات ضد XSS
            const safeStatus = escapeHtml(foundOrder.status);
            const safePhone = escapeHtml(foundOrder.phone || 'غير متوفر');
            const safeDetails = escapeHtml(foundOrder.details || 'لا توجد تفاصيل');
            const safeAddress = foundOrder.address ? escapeHtml(foundOrder.address) : '';
            const safeOrderId = escapeHtml(foundOrderId);
            const safeCreatedAt = createdAt ? escapeHtml(createdAt.toLocaleString('ar-EG')) : '';
            
            trackResult.className = 'success';
            trackResult.innerHTML = `
                <h3 style="margin-top: 0; color: ${statusColor.text};">📦 حالة الطلب: ${safeStatus}</h3>
                <p><strong>👤 الاسم:</strong> ${escapeHtml(foundOrder.name || "غير متوفر")}</p>
                <p><strong>📞 رقم الهاتف:</strong> ${safePhone}</p>
                <p><strong>📝 التفاصيل:</strong> ${safeDetails}</p>
                ${safeAddress ? `<p><strong>📍 العنوان:</strong> ${safeAddress}</p>` : ''}
                ${safeCreatedAt ? `<p><strong>🕒 تاريخ الطلب:</strong> ${safeCreatedAt}</p>` : ''}
            `;
            // <p style="margin-top: 10px; font-size: 0.9em; color: #666;">رقم الطلب الكامل: ${safeOrderId}</p> 

            // بدء تتبع الحالة في الوقت الفعلي
            trackOrderStatusRealTime(foundOrderId);
        } else {
            showTrackResult('error', '❌ لم يتم العثور على طلب بهذا الرقم. تأكد من إدخال رقم الطلب الصحيح.');
        }
        
    } catch (error) {
        console.error('خطأ في البحث عن الطلب:', error);
        showTrackResult('error', '❌ حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
        trackOrderBtn.disabled = false;
        trackOrderBtn.textContent = 'تحقق من الطلب';
    }
}

// وظيفة مساعدة لعرض نتائج البحث
function showTrackResult(type, message) {
    trackResult.style.display = 'block';
    trackResult.className = type;
    // استخدام textContent بدلاً من innerHTML للأمان
    trackResult.textContent = '';
    trackResult.appendChild(document.createTextNode(message));
}

// وظيفة للحصول على لون الحالة
function getStatusColorForTrack(status) {
    if (status.includes('تم التوصيل')) return { text: '#27ae60', bg: '#d4edda' };
    if (status.includes('في الطريق')) return { text: '#f39c12', bg: '#fff3cd' };
    if (status.includes('قيد التجهيز')) return { text: '#3498db', bg: '#cce7ff' };
    if (status.includes('جديد')) return { text: '#95a5a6', bg: '#e9f7ef' };
    if (status.includes('ملغي')) return { text: '#e74c3c', bg: '#f8d7da' };
    return { text: '#333', bg: '#f8f9fa' };
}

// تتبع حالة الطلب في الوقت الفعلي عند البحث
function trackOrderStatusRealTime(docId) {
    db.collection("orders").doc(docId).onSnapshot((doc) => {
        if (doc.exists) {
            const order = doc.data();
            const statusColor = getStatusColorForTrack(order.status);
            
            // تنظيف الحالة ضد XSS
            const safeStatus = escapeHtml(order.status);
            
            // تحديث النتيجة مباشرة (استخدام textContent بدلاً من innerHTML)
            const statusElement = trackResult.querySelector('h3');
            if (statusElement) {
                statusElement.textContent = `📦 حالة الطلب: ${order.status}`;
                statusElement.style.color = statusColor.text;
            }
        }
    });
}


// =======================================================
// 7. تهيئة كل شيء عند تحميل الصفحة
// =======================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing...');
    
    // الحصول على العناصر من الواجهة (HTML)
    orderForm = document.getElementById('order-form');
    orderNumberDisplay = document.getElementById('order-number-display');
    currentStatus = document.getElementById('current-status');
    phoneInput = document.getElementById('phone-number');
    
    // التحقق من وجود العناصر
    if (!orderForm) {
        console.error('❌ Order form not found');
        return;
    }
    if (!orderNumberDisplay) {
        console.error('❌ Order number display not found');
        return;
    }
    if (!currentStatus) {
        console.error('❌ Current status not found');
        return;
    }
    if (!phoneInput) {
        console.error('❌ Phone input not found');
        return;
    }
    if (!db) {
        console.error('❌ Database not initialized');
        alert('❌ خطأ في الاتصال بقاعدة البيانات. يرجى تحديث الصفحة.');
        return;
    }
    
    console.log('✅ All elements found, setting up...');
    
    // إعداد النموذج
    setupOrderForm();
    
    // إعداد التحقق من رقم الهاتف
    setupPhoneValidation();
    
    // إعداد التحقق من الطلب
    setupTrackOrder();
    
    // إضافة placeholder توضيحي (إذا لم يكن موجوداً في HTML)
    if (!phoneInput.placeholder) {
        phoneInput.placeholder = "مثال: 01000544420 (11 رقماً)";
    }
    
    console.log('✅ Page initialized successfully');
});