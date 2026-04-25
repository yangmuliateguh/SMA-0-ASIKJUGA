# Agents.md - Pedoman Pengembangan Backend "SMA 0 ASIKJUGA"

Dokumen ini berisi aturan teknis (Tech Rules) dan aturan fungsional (Domain Rules) untuk pengembangan aplikasi backend *headless* manajemen sekolah **SMA 0 ASIKJUGA**. Semua agen AI (Kilocode) wajib mematuhi panduan ini selama proses penulisan kode.

---

## 🛠️ TECH RULES (Aturan Teknis)

### 1. Tech Stack
- **Runtime:** Node.js
- **Bahasa:** TypeScript (Strict Mode aktif)
- **Framework Web:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Autentikasi & Keamanan:** JWT (JSON Web Token) dan Bcrypt
- **Validasi Data:** Zod

### 2. Coding Convention
- **Arsitektur:** Menggunakan *Clean Architecture* dengan pola aliran: `Route -> Middleware (Validasi/Auth) -> Controller -> Service -> Database (Prisma)`.
- **Asynchronous:** Wajib menggunakan `async/await` untuk semua proses I/O dan interaksi database. Hindari *callback hell*.
- **Error Handling:** Wajib memiliki *Global Error Handler*. Hindari melempar error mentah ke *client*; gunakan struktur response standar (contoh: `{ success: false, message: "...", error: "..." }`).
- **HTTP Status Codes:** Gunakan kode yang semantik (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
- **Validasi Middleware:** Validasi payload (body/query/params) wajib dilakukan menggunakan `Zod` di tingkat middleware sebelum menyentuh Controller.

### 3. Struktur Folder
Proyek harus mematuhi struktur direktori berikut di dalam `src/`:
```text
src/
├── config/       # Konfigurasi database & environment variables
├── controllers/  # Menangani HTTP request & response
├── middlewares/  # Autentikasi (JWT), RBAC (Role), Error Handler, Validator
├── routes/       # Definisi endpoint API dan routing
├── services/     # Tempat semua logika bisnis (Business Logic) berada
├── utils/        # Fungsi helper (Hashing, pembuatan JWT, dll)
└── validations/  # Definisi skema Zod
```

### 4. Testing & Build
- **Dev Server:** Gunakan `ts-node-dev` untuk proses *development* (`npm run dev`).
- **Build:** Kompilasi TypeScript ke JavaScript murni di dalam folder `dist/` sebelum *deployment* (`npm run build`).
- **Testing:** Mengikuti prinsip *Test-Driven Development* (TDD) jika diminta. Unit testing difokuskan pada *Service Layer* menggunakan library seperti `Jest` atau `Vitest`.

---

## 🏫 DOMAIN RULES (Aturan Fungsional / Domain)

### 1. Tujuan Proyek
Membangun sistem backend *headless* (RESTful API) yang kokoh untuk **SMA 0 ASIKJUGA**. Sistem ini menangani data akademik sekolah secara terpusat agar dapat dikonsumsi oleh aplikasi *Client* (Web SPA, Mobile App, dll) secara fleksibel, aman, dan efisien.

### 2. Aturan Bisnis (Business Logic)
- **Role-Based Access Control (RBAC):** Sistem memiliki 3 role mutlak: `ADMIN`, `TEACHER`, dan `STUDENT`.
- **Registrasi Sentralisasi:** Pembuatan akun HANYA boleh dilakukan oleh `ADMIN`. 
- **Transaksi Database:** Saat Admin mendaftarkan Siswa/Guru, proses pembuatan data di tabel `User` (untuk login) dan tabel `Student`/`Teacher` (untuk profil) wajib dibungkus dalam satu **Prisma Transaction** untuk mencegah data *orphaned* (tidak konsisten).
- **Integritas Input Nilai:** - Hanya role `TEACHER` yang memiliki otorisasi untuk menginput nilai.
  - Parameter `teacherId` saat input nilai tidak diambil dari body request, melainkan **diekstrak otomatis dari JWT payload** user yang sedang login.
  - Rentang input nilai (`score`) wajib di antara `0` hingga `100`.
- **Fitur Soft Delete:** Data pada entitas `Student` tidak boleh dihapus secara permanen (`DELETE` SQL) dari database. Gunakan pembaruan *flag* `isDeleted = true`.
- **Privasi Nilai:** Role `STUDENT` hanya berhak mengakses kueri nilai miliknya sendiri (difilter berdasarkan `userId` di JWT miliknya).

### 3. Terminologi Khusus
- **NISN:** *Nomor Induk Siswa Nasional*. Merupakan identifier unik (String/Varchar) untuk entitas `Student`.
- **NIP:** *Nomor Induk Pegawai*. Merupakan identifier unik (String/Varchar) untuk entitas `Teacher`.
- **Academic Year (Tahun Ajaran):** Format representasi tahun pendidikan berjalan (Contoh: `"2025/2026"`).
- **Semester:** Menunjukkan periode akademik, direpresentasikan dalam bentuk Integer (`1` untuk Ganjil, `2` untuk Genap).

### 4. Alur Wajib (Mandatory Flows)
- **Alur Autentikasi (Login Flow):** `Client` mengirim email & password $\rightarrow$ `Controller` memanggil `Service` untuk komparasi `bcrypt` $\rightarrow$ Sukses $\rightarrow$ Kembalikan JWT Token berisi `userId` & `role`. Request selanjutnya wajib menyertakan token di *header* `Authorization: Bearer <token>`.
- **Alur Pendaftaran User Baru (Admin Flow):**
  `Admin` POST data siswa $\rightarrow$ `Middleware` memvalidasi hak akses Admin & skema Zod $\rightarrow$ `Service` melakukan *Hashing* password $\rightarrow$ Memulai *Prisma Transaction* $\rightarrow$ Insert `User` & Insert `Student` $\rightarrow$ Return *Success*.
- **Alur Pengambilan Data Siswa (Soft Delete Flow):**
  Saat melakukan GET List `/students`, *Service* secara otomatis (default) harus memfilter dan hanya mengembalikan siswa dengan kondisi `isDeleted: false`.