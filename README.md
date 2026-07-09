# Dark Backend - نظام المصادقة

## نظرة عامة
نظام مصادقة كامل مع Express.js و MongoDB يتضمن:
- تسجيل الدخول للمستخدمين
- لوحة تحكم المشرف لإنشاء الحسابات
- حماية Routes ثنائية (مصادقة + صلاحيات المشرف)
- تشفير كلمات المرور باستخدام bcryptjs

## البنية
```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── models/
│   └── User.js         # User model with isAdmin
├── middleware/
│   └── auth.js         # Authentication & Admin middleware
├── routes/
│   ├── auth.js         # Login & Register routes
│   └── admin.js        # Admin management routes
├── .env                # Environment variables
├── package.json        # Dependencies
└── server.js           # Main server file
```

## الإعداد

### 1. تثبيت الاعتماديات
```bash
cd backend
npm install
```

### 2. إعداد MongoDB
تأكد من تشغيل MongoDB على جهازك أو استخدم MongoDB Atlas.

### 3. تكوين ملف .env
عدّل ملف `.env` بإعداداتك:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dark_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
```

### 4. تشغيل السيرفر
```bash
# للإنتاج
npm start

# للتطوير (مع auto-reload)
npm run dev
```

## API Endpoints

### المصادقة (Auth)
- `POST /api/auth/login` - تسجيل الدخول
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `POST /api/auth/register` - إنشاء مستخدم جديد (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, email, password, isAdmin }`
  - Returns: `{ _id, name, email, isAdmin }`

- `GET /api/auth/me` - الحصول على المستخدم الحالي
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ _id, name, email, isAdmin }`

### المشرف (Admin)
- `GET /api/admin/users` - عرض جميع المستخدمين (Admin only)
  - Headers: `Authorization: Bearer <token>`

- `POST /api/admin/users` - إنشاء مستخدم جديد (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, email, password, isAdmin }`

- `PUT /api/admin/users/:id` - تحديث مستخدم (Admin only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name, email, isAdmin }`

- `DELETE /api/admin/users/:id` - حذف مستخدم (Admin only)
  - Headers: `Authorization: Bearer <token>`

## إنشاء أول حساب Admin

بما أن إنشاء الحسابات متاح فقط للمشرفين، ستحتاج لإنشاء أول حساب admin يدوياً من MongoDB:

### الطريقة 1: باستخدام MongoDB Shell
```javascript
use dark_db
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$hashed_password_here", // استخدم bcrypt لتشفير كلمة المرور
  isAdmin: true,
  createdAt: new Date()
})
```

### الطريقة 2: باستخدام سكريبت Node
أنشئ ملف `createAdmin.js` في مجلد backend:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      isAdmin: true
    });
    console.log('Admin created:', admin);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

ثم شغله:
```bash
node createAdmin.js
```

## الحماية

### Middleware
- `protect` - يتحقق من وجود token صحيح
- `admin` - يتحقق من أن المستخدم مشرف (isAdmin: true)

### الاستخدام
```javascript
const { protect, admin } = require('./middleware/auth');

// Route محمي للمستخدمين المسجلين
router.get('/profile', protect, async (req, res) => {
  // req.user متاح هنا
});

// Route محمي للمشرفين فقط
router.delete('/users/:id', protect, admin, async (req, res) => {
  // فقط المشرف يمكن الوصول
});
```

## Frontend Integration

### تسجيل الدخول
- صفحة: `/login`
- تخزين token في localStorage
- توجيه المستخدم بناء على صلاحيته

### لوحة تحكم المشرف
- صفحة: `/admin/dashboard`
- محمية بـ AuthGuard (يتطلب تسجيل دخول + صلاحيات admin)
- إنشاء، تعديل، وحذف المستخدمين

### لوحة تحكم المستخدم
- صفحة: `/dashboard`
- محمية بـ AuthGuard (يتطلب تسجيل دخول فقط)

## ملاحظات أمنية
1. غيّر `JWT_SECRET` في الإنتاج
2. استخدم HTTPS في الإنتاج
3. قم بتحديد CORS origins بدلاً من السماح للجميع
4. قم بتحديد rate limiting لمنع هجمات Brute Force
