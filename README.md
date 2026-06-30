# 🍽️ The Tasty Plate - Restaurant Web Application

เว็บแอปพลิเคชันร้านอาหารแบบครบวงจรในรูปแบบ **Light Mode** ที่สวยงามและพรีเมียม รองรับการสั่งอาหารออนไลน์สำหรับลูกค้า (Customer Ordering Portal) ระบบจัดการหลังร้านสำหรับพนักงาน (Backoffice Management Dashboard) และการพิมพ์ใบเสร็จแบบเครื่องพิมพ์ความร้อน (POS Thermal Receipt 80mm) ขับเคลื่อนด้วยฐานข้อมูล **Supabase**

---

## 🛠️ Stack & Features

- **Frontend & Routing:** HTML5, CSS3 Variables (Vanilla CSS) & Pure JS Single Page Application (SPA).
- **Branding & Theme:** Elegant Light Mode, Serif Playfair Display headers, Outfit UI typography, and CSS micro-animations.
- **Database Engine:** Supabase PostgreSQL Database (พร้อมระบบสำรอง LocalStorage อัตโนมัติ).
- **POS Printing:** ระบบออกใบเสร็จ (Thermal POS Receipt 80mm) ในตัวพร้อมพิมพ์บาร์โค้ดจำลอง.
- **Reporting System:** แดชบอร์ดสรุปยอดขายและจำนวนสินค้าขายดีด้วยแผนภูมิวงกลมและเส้นผ่าน Chart.js.

---

## 📦 โครงสร้างโฟลเดอร์ในโปรเจกต์

```
├── index.html            # โครงสร้างหน้าเว็บหลักและการนำทาง (Routing)
├── vercel.json           # การตั้งค่า Routing และ Caching สำหรับขึ้นระบบ Vercel
├── setup.sql             # ไฟล์สคริปต์ SQL สำหรับรันใน Supabase Editor เพื่อสร้างตาราง
├── css/
│   └── style.css         # ไฟล์สไตล์สำหรับการแสดงผลและพิมพ์ใบเสร็จ
└── js/
    ├── config.js         # ไฟล์สำหรับกรอกคีย์เชื่อมต่อฐานข้อมูล Supabase
    ├── db.js             # ตัวจัดการฐานข้อมูล (Supabase + LocalStorage Fallback)
    ├── app.js            # โค้ดส่วนบริการฝั่งลูกค้า (สั่งอาหาร, ตะกร้าสินค้า)
    └── admin.js          # โค้ดส่วนบริการหลังร้านพนักงาน (จัดการโต๊ะ, เมนูอาหาร, พิมพ์ใบเสร็จ)
```

---

## 🚀 ขั้นตอนการติดตั้งฐานข้อมูล Supabase

1. สมัครใช้งานและสร้างโปรเจกต์ใหม่ที่ [Supabase.com](https://supabase.com)
2. เข้าไปที่เมนู **SQL Editor** ในแถบด้านซ้ายของ Supabase
3. เปิดไฟล์ `setup.sql` ในโปรเจกต์นี้ คัดลอกโค้ด SQL ทั้งหมดไปวางในหน้า SQL Editor ของ Supabase แล้วกด **Run**
4. เข้าไปที่เมนู **Project Settings > API** คัดลอกข้อมูล 2 ส่วนนี้:
   - **Project URL**
   - **Anon API Key (public)**
5. นำคีย์ที่คัดลอกมาใส่ในไฟล์ `js/config.js` ตามด้านล่างนี้:

```javascript
window.SUPABASE_CONFIG = {
    URL: "วาง URL ของ Supabase ที่นี่",
    ANON_KEY: "วาง Anon API Key ที่นี่"
};
```
*(หากยังไม่ได้กรอกคีย์ในโค้ด ระบบจะรันผ่านฐานข้อมูลของเบราว์เซอร์ LocalStorage อัตโนมัติ และคุณสามารถกรอกคีย์ได้ในหน้า Settings หลังร้าน)*

---

## 🔐 ข้อมูลเข้าสู่ระบบพนักงาน (Default Staff)

- **Username:** `admin`
- **Password:** `password123`

---

## 🐙 วิธีนำขึ้น GitHub (ชื่อคลังเก็บ: resturant)

1. เข้าไปที่หน้าเว็บ [GitHub](https://github.com) และสร้าง Repository ใหม่ ตั้งชื่อว่า `resturant`
2. เปิดโปรแกรม Terminal หรือ Git Bash ในเครื่องของคุณในตำแหน่งโฟลเดอร์โปรเจกต์นี้
3. พิมพ์คำสั่งรันดังนี้เพื่อส่งข้อมูลขึ้น GitHub:

```bash
git init
git add .
git commit -m "Initial commit of restaurant app"
git branch -M main
git remote add origin https://github.com/ชื่อผู้ใช้ของคุณ/resturant.git
git push -u origin main
```

---

## ☁️ วิธีการอัปโหลดไปเผยแพร่บน Vercel

1. เข้าสู่ระบบที่ [Vercel.com](https://vercel.com) (เข้าผ่านบัญชี GitHub)
2. คลิกที่ปุ่ม **Add New > Project**
3. เลือก Repository ที่ชื่อว่า `resturant` แล้วกด **Import**
4. ในส่วนการตั้งค่าต่างๆ ให้ปล่อยเป็นค่าเริ่มต้น เนื่องจากโปรเจกต์นี้เป็นหน้าเว็บ Static ที่เสร็จสมบูรณ์อยู่แล้ว
5. กดปุ่ม **Deploy** เพื่อเปิดใช้งานหน้าเว็บออนไลน์ได้ทันที!
