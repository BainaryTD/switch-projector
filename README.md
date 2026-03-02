<h1 align="center">🎥 Projector Control</h1>

<p align="center">
  🌐 <a href="#english">English</a> | 🇹🇭 <a href="#thai">ภาษาไทย</a>
</p>

---

<a name="english"></a>
## 🇬🇧 English

<p align="center">
  <strong>Multi-Monitor Media Presentation Application</strong><br>
  A reliable desktop solution for synchronized multi-video playback across multiple displays and projectors.
</p>

### 🌟 Features
- 🖥️ **Multi-Monitor Support:** Seamlessly separate the control panel from the projector display windows.
- ⏱️ **Synchronized Playback:** Powered by `SyncManager`, ensuring precise synchronization of play, pause, seek, and volume across multiple video elements simultaneously.
- 📑 **Playlist Management:** Easily queue and manage your media sequences.
- 🚀 **Desktop Native:** Built with Electron for high performance on desktop environments.

### 🛠️ Tech Stack
- **Framework:** [Electron](https://www.electronjs.org/) (Version 29+)
- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript
- **Build Tool:** [electron-builder](https://www.electron.build/)

### 💻 Installation & Development

**Prerequisites:**
- [Node.js](https://nodejs.org/) (LTS recommended)

**Steps:**
1. Clone the repository or extract the project files.
2. Open a terminal and navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in development mode:
   ```bash
   npm start
   ```

### 📦 Building the Executable (.EXE)

**1. Portable App (No installation required)**
Generates an executable folder that can be run immediately.
```bash
npx electron-packager . "Projector Control" --platform=win32 --arch=x64 --out=dist --overwrite
```

**2. Setup Installer**
Generates a standard Windows setup installer.
```bash
npm run dist
```

> 📖 **Detailed Build Guide:** See [`HOW_BUILD_EXE.md`](HOW_BUILD_EXE.md)

---

<a name="thai"></a>
## 🇹🇭 ภาษาไทย

<p align="center">
  <strong>แอปพลิเคชันควบคุมการนำเสนอสื่อมัลติมีเดียแบบหลายหน้าจอ</strong><br>
  ทำงานด้วยระบบซิงค์เวลาของวิดีโอหลายตัวให้เล่นพร้อมกันอย่างแม่นยำ เพื่อใช้แสดงผลบนหน้าจอโปรเจคเตอร์หรือจอแสดงผลอื่นๆ
</p>

### 🌟 จุดเด่นของโปรเจกต์ (Features)
- 🖥️ **รองรับหลายหน้าจอ (Multi-Monitor):** แยกหน้าต่างควบคุม (Control Panel) และหน้าจอแสดงผล (Projector) ออกจากกันอย่างเป็นอิสระ เพื่อง่ายต่อการนำเสนองาน
- ⏱️ **เล่นวิดีโอซิงค์พร้อมกัน (Synchronized Playback):** มีระบบ `SyncManager` ควบคุมวิดีโอหลายตัวให้เล่น, หยุดพัก, ข้ามเวลา (Seek) และปรับระดับเสียงได้อย่างพร้อมเพรียงและแม่นยำ
- 📑 **ระบบจัดการคิว (Playlist Management):** จัดการเพลย์ลิสต์และลำดับการแสดงผลของสื่อมัลติมีเดียได้อย่างสะดวก
- 🚀 **แอปพลิเคชันบนเดสก์ท็อป (Desktop Native):** พัฒนาด้วย Electron เพื่อให้ทำงานได้อย่างเต็มประสิทธิภาพและเสถียรบนคอมพิวเตอร์

### 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Framework:** [Electron](https://www.electronjs.org/) (Version 29+)
- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript
- **Build Tool:** [electron-builder](https://www.electron.build/)

### 💻 การติดตั้งและการพัฒนา

**สิ่งที่ต้องมีเบื้องต้น:**
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน LTS ล่าสุด)

**ขั้นตอนการทำงาน:**
1. โคลน (Clone) โปรเจกต์ หรือแตกไฟล์โปรเจกต์ไปยังโฟลเดอร์ปฏิบัติงาน
2. เปิด Terminal (หรือ Command Prompt) แล้วเข้าไปยังโฟลเดอร์ของโปรเจกต์
3. ติดตั้งไลบรารีที่จำเป็น (Dependencies):
   ```bash
   npm install
   ```
4. รันโปรเจกต์ในโหมดนักพัฒนา (Development Mode):
   ```bash
   npm start
   ```

### 📦 การสร้างไฟล์ติดตั้ง (Build .EXE)

**1. รูปแบบ Portable (ไม่ต้องติดตั้ง)**
แพ็คโปรเจกต์เป็นโฟลเดอร์ สามารถก๊อปปี้ไปเปิดใช้งานเครื่องอื่นได้ทันที
```bash
npx electron-packager . "Projector Control" --platform=win32 --arch=x64 --out=dist --overwrite
```

**2. รูปแบบ Setup Installer (ติดตั้งลงเครื่อง)**
แพ็คโปรเจกต์เป็นไฟล์ Setup เพื่อติดตั้งลง Windows ตามมาตรฐาน
```bash
npm run dist
```

> 📖 **ดูรายละเอียดการ Build เพิ่มเติมได้ที่ไฟล์:** [`HOW_BUILD_EXE.md`](HOW_BUILD_EXE.md)

---

<p align="center">
  <i>Developed by Mario</i>
</p>
