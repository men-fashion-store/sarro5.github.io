# الصاروووخ | تطبيق طلبات السوق

تطبيق العميل والإدارة والكابتن مبني بواجهة HTML واحدة مشتركة مع Firebase، وقابل للتثبيت كتطبيق Android عبر Capacitor.

## تشغيل الويب

```powershell
npm install
npm run web:serve
```

## إنشاء مشروع Android

المتطلبات: Node.js، JDK 21، Android Studio وAndroid SDK.

```powershell
npm install
npm run web:sync
npm run android:add
npm run android:sync
npm run android:open
```

بعد أي تعديل على ملفات `index.html` أو `admin.html` أو `driver.html` شغّل `npm run android:sync`.

## تطبيقات Android المنفصلة

المشروع ينتج ثلاثة تطبيقات مستقلة يمكن تثبيتها معًا على نفس الهاتف، وكلها تستخدم نفس مشروع Firebase وقاعدة Firestore:

```powershell
npm run android:client
npm run android:admin
npm run android:driver
```

ستجد ملفات APK في المسارات التالية:

- `android/app/build/outputs/apk/client/debug/app-client-debug.apk`
- `android/app/build/outputs/apk/admin/debug/app-admin-debug.apk`
- `android/app/build/outputs/apk/driver/debug/app-driver-debug.apk`

لكل تطبيق `applicationId` مختلف، لذلك لا يستبدل أحدها الآخر عند التثبيت. العميل يفتح `index.html`، والإدارة تفتح `admin.html`، والكابتن يفتح `driver.html`.

من Android Studio يمكن تشغيل التطبيق على هاتف أو إنشاء APK من:

`Build > Generate App Bundles or APKs > Generate APK`

## GitHub

```powershell
git init
git add .
git commit -m "Initialize Elsarokh market app"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

لا تضع مفاتيح سرية أو بيانات تشغيل حساسة داخل المستودع العام. قبل الإطلاق، فعّل Firebase Authentication وقواعد Firestore بصلاحيات منفصلة للعميل والإدارة والكابتن.
