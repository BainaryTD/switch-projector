# คู่มือการสร้างไฟล์แอปพลิเคชัน (.exe)

สำหรับการแพ็ค (Build) โปรเจกต์แอปควบคุมโปรเจกเตอร์นี้ให้กลายเป็นไฟล์ `.exe` สำหรับรันบน Windows 
เราจะใช้เครื่องมือมาตรฐานสองตัวที่มีให้เลือกใช้ตามความเหมาะสมครับ

## วิธีที่ 1: การใช้ Electron Packager (วิธีที่ใช้เมื่อสักครู่)
วิธีนี้ง่ายที่สุดและลดปัญหาเรื่องสิทธิ์ (Permissions) ใน Windows ระบบเราจะทำการแปลงโปรเจกต์เป็น "โปรแกรมแบบ Portable" หรือโฟลเดอร์ที่ก๊อปปี้ไปเปิดใช้งานได้เลยโดยไม่ต้องกด Install ครับ

**คำสั่งที่ใช้รันใน Terminal:**
```bash
npx electron-packager . "Projector Control" --platform=win32 --arch=x64 --out=dist --overwrite
```

**คำอธิบายคำสั่ง:**
- `npx electron-packager`: คือการเรียกใช้เครื่องมือสร้างไฟล์ของ Electron ทันที
- `.`: ชี้ว่าให้แพ็คจาก "โฟลเดอร์ปัจจุบัน" (Current Directory)
- `"Projector Control"`: ชื่อแอปและโฟลเดอร์ผลลัพธ์ที่จะได้
- `--platform=win32`: ระบุเป้าหมายว่าเป็น Windows OS
- `--arch=x64`: ระบุสถาปัตยกรรมแบบ 64-bit
- `--out=dist`: นำผลลัพธ์ไปเก็บรวมไว้ที่โฟลเดอร์ชื่อ `dist`
- `--overwrite`: ถ้าในโฟลเดอร์มีไฟล์เดิมอยู่แล้ว ให้บันทึกทับไปเลย

**ผลลัพธ์:**
- ระบบจะสร้างโฟลเดอร์ชื่อ `dist\Projector Control-win32-x64`
- สามารถเข้าโฟลเดอร์นั้น แล้วกดดับเบิ้ลคลิก `Projector Control.exe` ได้ทันที (ก๊อปทั้งโฟลเดอร์ไปให้คนอื่นใช้ได้เลย)

---

## วิธีที่ 2: การใช้ Electron Builder (สำหรับทำ Setup Installer)
ถ้าหากคุณอยากทำแอปเป็นตัวติดตั้ง ให้ผู้ใช้โหลดเป็นไฟล์เดียวแบบ Setup.exe แล้วต้องกด Next > Install เหมือนโปรแกรมมาตรฐาน เราจะใช้ `electron-builder`

**ขั้นตอนที่ใช้:**
1. เพิ่มเข้าไปในโปรเจกต์ (ซึ่งทำไว้ให้แล้ว):
```bash
npm install --save-dev electron-builder
```

2. ตั้งค่าไฟล์ `package.json` ส่วน `"build"` (เพิ่มไว้ให้แล้วเช่นกัน):
```json
  "build": {
    "appId": "com.mario.projectorcontrol",
    "productName": "Projector Control",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": ["nsis", "portable"]
    }
  }
```

3. รันคำสั่งสร้างตัวติดตั้งผ่านคำสั่งที่เราสร้างไว้:
```bash
npm run dist
```
 *(หมายเหตุ: วิธีนี้อาจเจอปัญหา Windows บล็อกสิทธิ์โฟลเดอร์ Cache หากเจอให้ลบโฟลเดอร์ %LOCALAPPDATA%\electron-builder ออก)*

**ผลลัพธ์:**
- ระบบจะไปสร้างไฟล์สำหรับติดตั้ง เช่น `Projector Control Setup 1.0.0.exe` อยู่ข้างในโฟลเดอร์ `dist` ครับ
