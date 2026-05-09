# แผนการปรับปรุง UI / UX — Projector Control

> เป้าหมาย: ปรับ **หน้าตา (UI)** และ **ประสบการณ์การใช้งาน (UX)** ให้ดีขึ้น
> โดย **ไม่เปลี่ยนโครงสร้างการทำงานเดิม** (IPC channels, ARM/PLAY/HOLD flow, captureStream live mirror, fade transition ฯลฯ)

---

## 1) สรุปภาพรวมระบบปัจจุบัน (อ้างอิงเพื่อไม่ทำพังของเดิม)

ส่วนที่ **ห้ามแตะ logic** เพราะเป็นแกนของแอป:

- IPC main↔renderer ใน [main.js](main.js) และ [src/preload.js](src/preload.js)
  - `ARM_MEDIA` → `PLAY_NOW` → `SHOW_HOLD`
  - `MEDIA_PLAY` / `MEDIA_PAUSE` / `MEDIA_SEEK` / `MEDIA_VOLUME`
  - `SET_LOOP` / `SET_FADE_TIME` / `set-monitor` / `capture-live`
- การส่ง state ARM แล้ว PLAY แบบหน่วง 50ms ใน [src/control.js:122-168](src/control.js#L122-L168)
- การ mirror วิดีโอด้วย `livePlayer.captureStream()` ใน [src/components/MediaDisplay.js:85-113](src/components/MediaDisplay.js#L85-L113)
- Fade-to-black + hold screen overlay ใน [src/display.js:34-90](src/display.js#L34-L90)

ฟีเจอร์ที่ทำงานอยู่แล้ว:
1. เลือก Monitor ปลายทาง
2. Queue/Playlist (เพิ่ม/ลบ/เลือก active)
3. Hold (Standby) → Send to Live, หรือ Quick Send
4. Loop / Keep Audio / Fade Time
5. Live Preview (mirror stream)
6. Snapshot Live → เพิ่มเข้า Queue
7. Emergency Cut to Standby

---

## 2) ปัญหาที่พบ (เรียงตามผลกระทบ)

### 🔴 ระดับ Critical (ต้องแก้ — กระทบการใช้จริง)

| # | ปัญหา | อยู่ที่ |
|---|---|---|
| C1 | โหลด **Tailwind ผ่าน CDN** ทำให้แอปต้องต่อเน็ต ไม่ทันงานสด | [src/control.html:7](src/control.html#L7) |
| C2 | พื้นหลัง Hold ใช้ **URL จาก unsplash.com** ออฟไลน์จะดำสนิท | [src/display.html:24](src/display.html#L24) |
| C3 | ไม่มี **keyboard shortcuts** — งานสดต้องคลิกตลอด เสี่ยงพลาด | ทั้ง control.js |
| C4 | ค่า fade/loop/keep-audio/monitor **ไม่ persist** เปิดใหม่รีเซ็ตหมด | ทั้ง control.js |

### 🟡 ระดับ High (ปรับแล้วใช้ลื่นขึ้นชัดเจน)

| # | ปัญหา | อยู่ที่ |
|---|---|---|
| H1 | ไม่มี **drag-and-drop** เพิ่มไฟล์ ต้องผ่าน dialog เท่านั้น | [src/control.js:35-44](src/control.js#L35-L44) |
| H2 | คิวเรียงใหม่ไม่ได้ (no reorder) | [src/components/Playlist.js](src/components/Playlist.js) |
| H3 | ไม่มี **status badge** บอกว่า "ARMED" แล้ว — ผู้ใช้ไม่รู้ว่า Send to Hold สำเร็จหรือยัง | control.html / control.js |
| H4 | ไม่มี **timeline / volume slider** ใน Live Controls panel — ต้อง seek ผ่าน controls ของ video tag เท่านั้น | control.html B section |
| H5 | ปุ่มสำคัญ (Send to Live, Emergency) **ไม่มี confirm/visual feedback** ตอนกด | control.js |
| H6 | display window ไม่มี **Esc-to-exit** หรือคำแนะนำออกจาก fullscreen | display.html / main.js |

### 🟢 ระดับ Nice-to-have (ทำเพิ่มได้ภายหลัง)

| # | ปัญหา |
|---|---|
| N1 | ไม่มี **thumbnails** ในคิว — ดูชื่อไฟล์อย่างเดียว |
| N2 | ไม่มี **save/load playlist** เป็นไฟล์ JSON |
| N3 | ไม่มี **auto-advance** เล่นตัวต่อไปอัตโนมัติเมื่อจบ |
| N4 | ไฟล์ [src/style.css](src/style.css) เป็น **dead code** (ไม่ได้ใช้แล้ว เพราะย้ายไป Tailwind) |
| N5 | ไม่มี **error UI** เมื่อโหลดสื่อพัง (เช่น path เพี้ยน) |
| N6 | ไม่มี **window min-size** บน control window — ย่อจนเล็กกว่าที่ใช้ได้ |

---

## 3) แผนปรับ — แบ่งเป็นเฟส

### 📦 Phase 1 — Robustness (ทำก่อน, ของเดิมต้องไม่พัง)

#### 1.1 ติดตั้ง Tailwind แบบ local (แก้ C1)

**ทำไม:** CDN จะค้างเวลางานสดถ้าเน็ตช้า/หาย และเริ่มแอปช้าทุกครั้ง

**ทางเลือก A — Tailwind CLI (แนะนำ):**
```bash
npm i -D tailwindcss @tailwindcss/cli
```
- เพิ่ม script ใน [package.json](package.json):
  ```json
  "scripts": {
    "build:css": "tailwindcss -i ./src/tailwind.in.css -o ./src/tailwind.css --minify",
    "watch:css": "tailwindcss -i ./src/tailwind.in.css -o ./src/tailwind.css --watch"
  }
  ```
- สร้าง `src/tailwind.in.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- ใน [src/control.html](src/control.html) ลบ `<script src="https://cdn.tailwindcss.com">` แล้วใส่
  ```html
  <link rel="stylesheet" href="tailwind.css">
  ```
- รัน `npm run build:css` ก่อน `electron .` (จะ wire เข้าไปใน build script ของ electron-builder)

**ทางเลือก B (เร็วสุด, ไม่อยากตั้ง toolchain):**
- ดาวน์โหลด `tailwind.min.css` ที่ build แล้วมาวางใน `src/` แล้วลิงก์ตรง ๆ
- ข้อเสีย: ไฟล์อ้วนกว่า เพราะไม่ purge

#### 1.2 เปลี่ยน background hold เป็นไฟล์ภายใน (แก้ C2)

แก้ [src/display.html:24](src/display.html#L24): เปลี่ยน `url('https://images.unsplash.com/...')` เป็น
```css
background: #0a0a0a linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
```
หรือใส่ภาพ local ใน `src/assets/hold-bg.jpg` แล้วใช้ `background: url('assets/hold-bg.jpg') center/cover;`

#### 1.3 Persist settings ผ่าน localStorage (แก้ C4)

เพิ่มใน [src/control.js](src/control.js) (renderer-only ก็พอ ไม่ต้องแตะ main):
```js
const SETTINGS_KEY = 'projector.settings.v1';
const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
};
const saveSettings = (patch) => {
  const cur = loadSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...cur, ...patch }));
};
```
ค่าที่ต้อง persist: `fadeTime`, `loop`, `keepAudio`, `lastMonitorIndex`
- โหลดตอน `DOMContentLoaded` แล้ว set ค่า input + ส่ง IPC ตามเดิม
- บันทึกทุกครั้งที่ user เปลี่ยนค่า

---

### 🎯 Phase 2 — UX สำคัญสำหรับงานสด

#### 2.1 Keyboard shortcuts (แก้ C3)

เพิ่ม listener ใน [src/control.js](src/control.js) — **เช็ก `e.target` เพื่อไม่ trigger ขณะพิมพ์ใน input**:

| คีย์ | การทำงาน |
|---|---|
| `Space` | Play / Pause (ส่ง MEDIA_PLAY หรือ MEDIA_PAUSE) |
| `Enter` | กดปุ่ม "Send to Live (Play Now)" — ถ้า disabled ให้ทำ Quick Send แทน |
| `B` | Emergency Cut to Standby (Black) |
| `↑` / `↓` | เลื่อน active item ใน queue |
| `Delete` | ลบ active item ออกจาก queue |
| `S` | Send to Hold |
| `L` | Toggle Loop |
| `K` | Toggle Keep Audio |

แสดงรายการ shortcut เป็น tooltip บนปุ่ม + เพิ่มกล่องเล็ก ๆ "Press `?` for shortcuts" มุมล่างขวา

#### 2.2 Drag & drop ไฟล์ (แก้ H1)

ที่ `#playlistContainer` หรือทั้ง body:
```js
window.addEventListener('dragover', e => { e.preventDefault(); /* show overlay */ });
window.addEventListener('drop', e => {
  e.preventDefault();
  const paths = [...e.dataTransfer.files]
    .map(f => f.path)
    .filter(p => /\.(mp4|mkv|mov|webm|mp3|wav|png|jpe?g|gif|webp)$/i.test(p));
  if (paths.length) playlist.addFiles(paths);
});
```
+ เพิ่ม overlay "Drop here" สวย ๆ ตอน dragover

#### 2.3 ARMED status badge (แก้ H3)

ใน [src/control.html](src/control.html) panel A เพิ่ม:
```html
<span id="armedBadge" class="hidden bg-yellow-500 text-black px-2 py-0.5 rounded font-bold text-xs">ARMED</span>
```
ใน control.js เมื่อกด Send to Hold สำเร็จ → `armedBadge.classList.remove('hidden')`
เมื่อ Send to Live หรือ Emergency → ซ่อนกลับ

#### 2.4 Reorder คิวด้วย drag (แก้ H2)

ใน [src/components/Playlist.js](src/components/Playlist.js) ใช้ HTML5 Drag-and-Drop API native:
```js
itemObj.draggable = true;
itemObj.addEventListener('dragstart', e => {
  e.dataTransfer.setData('text/plain', String(index));
});
itemObj.addEventListener('dragover', e => e.preventDefault());
itemObj.addEventListener('drop', e => {
  e.preventDefault();
  const from = +e.dataTransfer.getData('text/plain');
  if (from === index) return;
  const [moved] = this.queue.splice(from, 1);
  this.queue.splice(index, 0, moved);
  this.render();
});
```

#### 2.5 Esc-to-exit + status hint (แก้ H6)

ใน [main.js](main.js) `createDisplayWindow` เพิ่ม:
```js
displayWindow.webContents.on('before-input-event', (event, input) => {
  if (input.key === 'Escape') displayWindow.setFullScreen(false);
  if (input.key === 'F11') displayWindow.setFullScreen(!displayWindow.isFullScreen());
});
```
ใน [src/display.html](src/display.html) เพิ่ม overlay เล็ก ๆ มุมล่าง (จาง ๆ หายไปใน 3 วินาที):
```html
<div id="exitHint" style="position:fixed;bottom:8px;right:12px;color:#666;font-size:11px;font-family:monospace;opacity:0.6;">Esc to exit fullscreen</div>
```

---

### ✨ Phase 3 — Polish UI

#### 3.1 Live timeline + volume slider (แก้ H4)

ใน panel B ของ control.html เพิ่มแถบใต้ video:
```html
<div class="flex items-center gap-2 text-xs">
  <span id="liveTime">0:00</span>
  <input type="range" id="liveSeek" min="0" max="100" value="0" step="0.1" class="flex-1">
  <span id="liveDuration">0:00</span>
  <span class="ml-2">🔊</span>
  <input type="range" id="liveVol" min="0" max="1" step="0.01" value="1" class="w-24">
</div>
```
เชื่อมกับ `livePlayer` (ที่ SyncManager ดูอยู่แล้ว) — slider input → set `livePlayer.currentTime` / `livePlayer.volume`. SyncManager จะส่ง IPC ให้เอง ไม่ต้องเขียนเพิ่ม

#### 3.2 Visual feedback ตอนกดปุ่มสำคัญ (แก้ H5)

ปุ่ม Emergency / Send to Live: เพิ่ม class flash 200ms เมื่อ trigger (จาก keyboard ก็ตาม)
```js
const flash = (id) => {
  const el = document.getElementById(id);
  el.classList.add('ring-4','ring-white');
  setTimeout(() => el.classList.remove('ring-4','ring-white'), 200);
};
```

#### 3.3 Layout responsive (แก้ความอึดอัด)

- เปลี่ยน `max-w-4xl` ใน control.html เป็น `max-w-6xl` หรือ `w-full` ให้ panel A/B กว้างขึ้น
- เพิ่ม `flex-col md:flex-row` ในส่วน split view เพื่อ stack เมื่อหน้าต่างแคบ
- ใน [main.js:9-20](main.js#L9-L20) เพิ่ม `minWidth: 900, minHeight: 700`

#### 3.4 ลบ dead code (แก้ N4)

ตรวจว่า [src/style.css](src/style.css) ไม่ถูก link จากที่ไหน → ลบทิ้งทั้งไฟล์
(ตอนนี้ control.html ใช้ Tailwind หมดแล้ว, display.html มี style ของตัวเองใน `<head>`)

---

### 🌟 Phase 4 — เพิ่มเติม (เลือกทำ)

| ฟีเจอร์ | สรุป |
|---|---|
| Thumbnails ในคิว (N1) | ใช้ `<canvas>` + `drawImage` จาก `<video>` frame แรก หรือ `URL.createObjectURL` สำหรับรูป |
| Save/Load playlist (N2) | `electronAPI.saveJSON(paths)` + `loadJSON()` IPC ใหม่ใน main.js — เก็บ array ของ paths |
| Auto-advance (N3) | ใน display.js ตอน `videoPlayer.onended` ส่ง IPC `MEDIA_ENDED` กลับ control → playlist เลือกตัวถัดไปแล้ว ARM+PLAY |
| Error UI (N5) | `videoPlayer.onerror` / `imageElem.onerror` → แสดง toast แดง "ไม่พบไฟล์" |

---

## 4) ตารางลำดับงานแนะนำ

| ลำดับ | งาน | เวลาโดยประมาณ | ความเสี่ยง |
|---|---|---|---|
| 1 | 1.2 Background hold (local) | 5 นาที | ต่ำ |
| 2 | 1.1 Tailwind local | 30-60 นาที | ปานกลาง (ต้อง build pipeline) |
| 3 | 1.3 Persist settings | 20 นาที | ต่ำ |
| 4 | 2.3 ARMED badge | 15 นาที | ต่ำ |
| 5 | 2.1 Keyboard shortcuts | 30 นาที | ต่ำ |
| 6 | 2.2 Drag & drop | 20 นาที | ต่ำ |
| 7 | 2.5 Esc + hint | 15 นาที | ต่ำ |
| 8 | 2.4 Reorder คิว | 30 นาที | ปานกลาง |
| 9 | 3.1 Timeline + volume | 45 นาที | ต่ำ |
| 10 | 3.2 / 3.3 / 3.4 Polish | 30 นาที | ต่ำ |

---

## 5) วิธีตรวจว่าของเดิมไม่พัง (regression checklist)

หลังแก้ทุกข้อให้ทดสอบครบเช็คลิสต์นี้:

- [ ] เพิ่มไฟล์เข้า queue ผ่านปุ่ม "Add Files..."
- [ ] คลิกไฟล์ในคิว → Hold preview ขึ้นในแผง A
- [ ] กด "Send to Hold Screen" → display window ขึ้น "READY // STANDBY"
- [ ] กด "Send to Live (Play Now)" → display เล่น, panel C mirror เห็นภาพตรงกัน
- [ ] ระหว่างวิดีโอเล่น เลือกอีกไฟล์ → กด Quick Send → fade-to-black แล้วเปลี่ยน
- [ ] เช็ก Keep Audio: รูปภาพ + Quick Send ขณะมีวิดีโอ → เสียงวิดีโอเดิมยังอยู่
- [ ] กด Emergency Cut → display กลับมา Hold, panel C ขึ้น Standby
- [ ] เปลี่ยน Monitor ใน dropdown → display window ย้ายจอจริง
- [ ] Snapshot Live → ภาพ snapshot โผล่ในคิว
- [ ] ปรับ Fade Time → transition จริงตามค่า
- [ ] Loop checkbox → วิดีโอวนซ้ำ

---

## 6) ไฟล์ที่จะถูกแตะ (สรุป)

| ไฟล์ | จะแก้อะไร |
|---|---|
| [package.json](package.json) | เพิ่ม tailwind devDep + scripts build:css |
| [src/control.html](src/control.html) | ลบ CDN, เพิ่ม `<link>` tailwind, เพิ่ม armedBadge / timeline / volume slider |
| [src/control.js](src/control.js) | settings persist, keyboard shortcuts, drag-drop, ARMED state, flash feedback |
| [src/components/Playlist.js](src/components/Playlist.js) | drag-to-reorder |
| [src/display.html](src/display.html) | bg local, exitHint |
| [main.js](main.js) | minWidth/minHeight, before-input-event Esc/F11 |
| `src/tailwind.in.css` (ใหม่) | source ของ tailwind |
| `src/tailwind.css` (ใหม่, generated) | output |
| ลบ [src/style.css](src/style.css) | dead code |

ไฟล์ที่ **ไม่ต้องแตะ** (logic แกน):
- [src/preload.js](src/preload.js)
- [src/components/SyncManager.js](src/components/SyncManager.js)
- [src/components/MediaDisplay.js](src/components/MediaDisplay.js)
- [src/components/MonitorSetup.js](src/components/MonitorSetup.js)
- [src/display.js](src/display.js)
