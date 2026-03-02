<h1 align="center">🎥 Projector Control</h1>

<p align="center">
  <strong>แอปพลิเคชันควบคุมการนำเสนอสื่อมัลติมีเดียแบบหลายหน้าจอ (Multi-Monitor Media Presentation App)</strong><br>
  ทำงานด้วยระบบซิงค์เวลาของวิดีโอหลายตัวให้เล่นพร้อมกันอย่างแม่นยำ เพื่อใช้แสดงผลบนหน้าจอโปรเจคเตอร์หรือจอแสดงผลอื่นๆ
</p>

---

## 🌟 จุดเด่นของโปรเจกต์ (Features)
- 🖥️ **Multi-Monitor Support:** รองรับการแสดงผลแยกหน้าจอระหว่างส่วนควบคุมอค และส่วนแสดงผล (Projector)
- ⏱️ **Synchronized Playback:** มีระบบ `SyncManager` ควบคุมวิดีโอหลายตัวให้เล่น, หยุดพัก, ข้ามเวลา (seek) และปรับระดับเสียงได้อย่างพร้อมเพรียง
- 📑 **Playlist Management:** ระบบจัดการเพลย์ลิสต์สำหรับควบคุมลำดับการแสดงสื่อ
- 🚀 **Desktop Native:** พัฒนาด้วย Electron เพื่อให้ทำงานเป็นแอปพลิเคชันบน Desktop ได้อย่างเต็มประสิทธิภาพ

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Framework:** [Electron](https://www.electronjs.org/) (Version 29+)
- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript
- **Build Tool:** [electron-builder](https://www.electron.build/)

---

## 💻 การติดตั้งและการพัฒนา (Installation & Development)

### สิ่งที่ต้องมีเบื้องต้น (Prerequisites)
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน LTS ล่าสุด)
- npm (มาพร้อมกับ Node.js)

### ขั้นตอนการรันโปรเจกต์
1. โคลน (Clone) โปรเจกต์ หรือแตกไฟล์โปรเจกต์ไปยังโฟลเดอร์ที่คุณต้องการ
2. เปิด Terminal (หรือ Command Prompt) และเข้าไปยังโฟลเดอร์โปรเจกต์
3. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
4. รันโปรเจกต์ในโหมดนักพัฒนา (Development):
   ```bash
   npm start
   ```

---

## 📦 การสร้างไฟล์ติดตั้ง (Build Executable / .EXE)

โปรเจกต์นี้สามารถแพ็คเป็นไฟล์ `.exe` สำหรับระบบปฏิบัติการ Windows ได้ 2 รูปแบบหลักๆ ได้แก่:

### 1. รูปแบบ Portable (ไม่ต้องติดตั้ง)
แอปพลิเคชันจะถูกสร้างเป็นโฟลเดอร์ที่สามารถก๊อปปี้ไปใช้งานได้ทันที (ใช้งานง่ายและลดปัญหาสิทธิ์ของ Windows)
```bash
npx electron-packager . "Projector Control" --platform=win32 --arch=x64 --out=dist --overwrite
```

### 2. รูปแบบ Setup Installer (ติดตั้งลงเครื่อง)
แอปพลิเคชันจะถูกสร้างเป็นไฟล์ Setup ให้ผู้ใช้งานกด Install ตามมาตรฐาน
```bash
npm run dist
```
*หมายเหตุ: ไฟล์ผลลัพธ์ทั้งหมดจะถูกเก็บไว้ที่โฟลเดอร์ `dist/` หรือตามที่กำหนดไว้ในไฟล์ `HOW_BUILD_EXE.md`*

> 📖 **ดูรายละเอียดเพิ่มเติมเกี่ยวกับการ Build ได้ที่ไฟล์:** [`HOW_BUILD_EXE.md`](HOW_BUILD_EXE.md)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)
```text
switch-projector/
├── src/                    # โค้ดส่วนหน้าจอและการทำงานเบื้องหลัง
│   ├── components/         # ส่วนประกอบย่อย (เช่น SyncManager.js, Playlist.js)
│   ├── control.html        # หน้าต่างควบคุมหลัก (Control Panel)
│   └── control.js          # สคริปต์หน้าควบคุม
├── main.js                 # ไฟล์เริ่มต้นและจัดการ Window ของ Electron
├── HOW_BUILD_EXE.md        # คู่มือแนะนำการสร้างไฟล์ .exe โดยละเอียด
├── package.json            # ไฟล์จัดการ Dependencies และตั้งค่าการ Build
└── README.md               # ไฟล์อธิบายโปรเจกต์นี้
```

---

*พัฒนาและดูแลโดย [Mario]*
