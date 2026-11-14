# GatraVolt — Game Pembelajaran Fisika Berbasis MOBA

- **Tim:** *tolong mas tokennya abis* — Gestia Deviana, Rafi Praja Syahputra, Muhammad Hadist Rifannan
- **Kategori:** Web (PWA) + Mobile (APK Android)
- **Nama aplikasi:** GatraVolt — Game Pembelajaran Fisika Berbasis MOBA
- **Aplikasi online:** <https://gatravolt.onrender.com>

## Latar belakang

### Masalah yang diangkat

Ada dua masalah yang saling bertabrakan di ruang yang sama: waktu dan perhatian
pelajar.

**1. Fisika dianggap sulit, abstrak, dan tidak menarik.** Momentum, impuls,
tumbukan, serta proyektil biasanya disampaikan sebagai rumus di papan dan soal
hitung di buku, sehingga siswa sulit melihat hubungan antara rumus dan kejadian
nyata di sekitarnya. Latihan pun jarang memberi umpan balik langsung, dan
kesalahpahaman konsep baru ketahuan setelah ujian. Dampaknya terlihat pada
capaian: literasi sains Indonesia berada di **383 poin (level 1a)** pada PISA
2022, jauh di bawah rata-rata OECD (~485), dan **hanya 36,81%** siswa mencapai
level 2 alias kompetensi minimum sains — artinya sekitar **63% belum
mencapainya**.

**2. Energi pelajar habis di game, bukan untuk belajar.** Indonesia adalah pasar
gim besar: **154,9 juta pemain** (peringkat ke-4 dunia menurut Komdigi, 2024) dan
**42,23%** pemain game online bermain **lebih dari 4 jam per hari** (APJII, 2023).
Sebagian berlanjut menjadi masalah serius: adiksi game pada pelajar Indonesia
diperkirakan mencapai **~10,15%**, dengan dampak seperti gangguan tidur,
prokrastinasi, hingga penurunan prestasi.

Jadi, waktu luang pelajar sudah besar sekali — tetapi disalurkan ke aktivitas
yang tidak menyentuh pemahaman konsep fisika. Buku teks tidak bisa bersaing
memperebutkan perhatian itu, dan menambah soal latihan hanya menambah beban.

### Solusi

GatraVolt menyatukan dua dunia itu: **mengubah game dari pengalih perhatian
menjadi ruang belajar**. Ini bukan aplikasi kuis yang ditempeli mini-game, dan
bukan juga game yang ditempeli kuis — fisika adalah mekaniknya.

- **MOBA fisika 3v3 real-time** yang dimainkan online: cari lawan lewat
  matchmaking atau buat room privat dan bagikan kodenya ke teman; slot yang belum
  terisi otomatis diisi bot, jadi tetap bisa dimainkan sendiri.
- **Fisika sebagai hukum dunia, bukan tempelan**: gerak memakai momentum,
  serangan adalah proyektil bermassa, dash memberi impuls, cover memantulkan
  proyektil dan hancur oleh energi tumbukan (lihat [PRD.md](./PRD.md) §5).
- **Soal di dalam pertempuran, bukan sebelum/sesudahnya**: momen penting
  diselesaikan lewat **kuis menara** (jawaban benar = damage besar) dan **kuis
  hidup kembali** (2 soal tanpa timer untuk bangkit). Jawaban salah langsung
  diberi **penalti yang bisa dirasakan**, bukan sekadar skor di akhir.
- **Jembatan dari bermain ke belajar**: modul **Materi / Latihan / Latihan
  Harian** dan **Asisten Fisika** (chatbot AI yang hanya menjawab dari materi
  game), plus server otoritatif, AI takeover saat koneksi terputus, dan client
  desktop Electron.

### Keselarasan dengan Kurikulum Merdeka

Desain GatraVolt sengaja mengikuti pendekatan **Pembelajaran Mendalam**
(Kemendikdasmen) yang menekankan tiga prinsip — **berkesadaran (mindful),
bermakna (meaningful), dan menggembirakan (joyful)** — dengan pengalaman belajar
**memahami → mengaplikasi → merefleksi**.

| Prinsip Pembelajaran Mendalam | Wujud di GatraVolt |
|---|---|
| **Menggembirakan (joyful)** | Pertarungan MOBA 3v3, knockout, ultimate, dan teman sebaya. Belajar terasa seperti bermain, bukan tugas tambahan. |
| **Bermakna (meaningful)** | Konsep fisika punya akibat nyata dan langsung: rumus momentum benar-benar menghancurkan menara; soal salah benar-benar memperlambatmu. Aplikasi konsep, bukan hafalan. |
| **Berkesadaran (mindful)** | Tiga tingkat soal memilih, penjelasan jawaban, modul Materi sebelum berlatih, dan kuis hidup kembali yang menuntut pemain sadar akan konsep yang salah. |
| **Memahami → mengaplikasi → merefleksi** | Lebar Materi (memahami) → Latihan & soal dalam (mengaplikasi) → penjelasan jawaban + Latihan Harian (merefleksi). |
| **Dimensi profil lulusan** | Penalaran kritis dan kolaborasi dilatih lewat pemilihan strategi menyerang menara dan kerja sama 3v3; kemandirian lewat Latihan Harian. |
| **Pemanfaatan teknologi digital** | PWA/APK, real-time multiplayer, dan Asisten Fisika AI sebagai pendamping di luar jam pelajaran. |

### Dasar data

| Data | Angka | Sumber |
|---|---|---|
| Skor literasi sains Indonesia, PISA 2022 | 383 poin (level 1a); OECD ~485 | OECD/PISA 2022 |
| Siswa mencapai kompetensi minimum (level 2) sains | 36,81% (≈63% di bawahnya) | PISA 2022 (diolah Kompas) |
| Pemain gim di Indonesia | 154,9 juta, peringkat ke-4 dunia | Komdigi, *Peta Ekosistem Industri Gim Indonesia 2024* |
| Pemain game online bermain >4 jam/hari | 42,23% | APJII, *Survei Penetrasi & Perilaku Internet 2023* |
| Perkiraan adiksi game pada pelajar Indonesia | ≈10,15% | Jurnal Keperawatan (Unpad) |
| Efektivitas serious game | Lebih efektif & lebih memotivasi daripada pengajaran konvensional (k=77, N=5.547) | Wouters dkk., *Journal of Educational Psychology* 105(2), 2013 |
| Prinsip Pembelajaran Mendalam | Berkesadaran, bermakna, menggembirakan | Kemendikdasmen, *Sistem Informasi Kurikulum Nasional* |

**Sumber lengkap:**
[OECD PISA 2022](https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/indonesia_c2e1ae0e-en.html) ·
[PISA 2022 (Kompas.id)](https://www.kompas.id/artikel/adakah-perbaikan-skor-pisa-indonesia) ·
[Pemain gim Indonesia 154,9 juta (Kompas.id, Komdigi 2024)](https://www.kompas.id/artikel/indonesia-jadi-pasar-semata-industri-game-lokal-butuh-dukungan) ·
[42,23% main >4 jam/hari (APJII 2023)](https://jateng.tribunnews.com/2023/12/18/wasapadai-anak-anda-terlalu-lama-main-game-online-bisa-depresi-dan-berkata-kotor) ·
[Adiksi game pelajar ≈10,15% (Jurnal Keperawatan Unpad)](https://jurnal.unpad.ac.id/jnc/article/view/39044) ·
[Wouters dkk. 2013](https://psycnet.apa.org/record/2013-03484-001) ·
[Pembelajaran Mendalam, Kemendikdasmen](https://kurikulum.kemendikdasmen.go.id/pembelajaran-mendalam)

### Target pengguna

- **Siswa SMA (utama)**, khususnya kelas yang sedang mempelajari momentum,
  impuls, tumbukan, dan proyektil — termasuk yang merasa fisika sulit atau bosan.
- **Guru fisika SMA** yang mencari media ajar interaktif, bisa dipakai untuk
  pengayaan, tugas bermain, atau Latihan Harian di kelas.
- **Pemain umum penggemar MOBA** yang ingin mencoba tanpa latar belakang fisika
  mendalam (tiga tingkat soal membuat pemula tetap bisa bermain).

<p align="center">
  <a href="https://gatravolt.onrender.com">
    <img alt="Main sekarang di server online" src="https://img.shields.io/badge/Main-Sekarang-2ea44f?style=for-the-badge&logo=googlechrome&logoColor=white">
  </a>
  <a href="https://github.com/raffsyahputra3-sys/tolongmastokennyaabis/releases/latest/download/GatraVolt.apk">
    <img alt="Download APK Android" src="https://img.shields.io/badge/Download-APK%20Android-3DDC84?style=for-the-badge&logo=android&logoColor=white">
  </a>
  <a href="https://render.com/deploy?repo=https://github.com/raffsyahputra3-sys/tolongmastokennyaabis">
    <img alt="Deploy server online" src="https://img.shields.io/badge/Deploy-Server%20Online-46E3B7?style=for-the-badge&logo=render&logoColor=white">
  </a>
</p>

## Fitur utama

- Pertandingan MOBA fisika **3v3 real-time lintas internet** (WebSocket, server otoritatif 30 Hz).
- **Matchmaking online** dan **room privat** dengan kode; slot kosong otomatis diisi bot.
- **Peta 3 lane** dengan menara berlapis, Nexus terlindungi, cover fisika, dan minion bertema faksi.
- **6 hero** dengan gaya main dan ultimate khas, lengkap dash, shockwave, dan dash-aim.
- **Kuis menara** (aksi SERANG SOAL / `F` saat membidik menara): jawaban benar = damage besar.
- **Kuis hidup kembali**: pemain tumbang hidup lagi dengan menjawab 2 soal (bukan timer).
- **AI takeover** saat pemain terputus dan **reconnect** dalam 60 detik tanpa kehilangan sesi.
- **Modul belajar**: Materi, Latihan, dan Latihan Harian (streak harian).
- **Asisten Fisika**: chatbot AI hemat token (retrieval chunk + template, bisa baca foto soal).
- **Multi-platform**: browser/PWA, **APK Android** native (Capacitor), dan desktop **Electron**.
- **Kontrol sentuh** (joystick, drag-aim) dengan HUD responsif untuk layar HP.
- **Efek layar** ultimate, audio prosedural, dan pengaturan aksesibilitas (kilatan/getar/jumpscare).
- **Akun pemain opsional** (Supabase) dengan RLS serta hak ekspor & hapus data.
- **Deploy otomatis**: Render untuk server, GitHub Actions untuk APK.

## Teknologi

| Lapisan | Dipakai |
|---|---|
| Bahasa | JavaScript (ES Modules), HTML, CSS |
| Client game | Canvas 2D + **Three.js** (WebGL) untuk arena 3D, Web Audio API, Service Worker (PWA) |
| Desktop | **Electron** |
| Mobile | **Capacitor 8** (APK Android native) + PWA |
| Server | **Node.js 20+** (`node:http`) + **`ws`** (WebSocket), simulasi fisika 30 Hz |
| Database & Auth | **Supabase** — Postgres + Auth + Row Level Security (opsional; diakses lewat REST/PostgREST tanpa SDK) |
| AI | **Helipod AI gateway** (model `qwen-vl-ocr`) via `POST /api/asisten` |
| API internal | WebSocket protokol game, `GET /healthz`, `POST /api/asisten` |
| Hosting & CI | **Render** (`render.yaml`) dan **GitHub Actions** + Releases (APK) |
| Tunnel | **Cloudflare quick tunnel** (`npm run online`) untuk link publik sementara |
| Pengujian | `node:test` (`npm test`) dan `scripts/check.mjs` (`npm run check`) |

Pustaka pihak ketiga yang disertakan: **Three.js** (MIT) dan `ws`. Daftar lengkap
atribusi ada di [CREDITS.md](./CREDITS.md).

## Sudah online

Server game sudah berjalan di Render:

| Layanan | Alamat |
|---|---|
| Game (browser / PWA) | https://gatravolt.onrender.com |
| Health check | https://gatravolt.onrender.com/healthz |
| WebSocket (dipakai APK) | `wss://gatravolt.onrender.com` |

Buka alamat game di browser HP/laptop, atau tekan **Download APK Android** lalu
biarkan aplikasi memakai alamat server bawaan. Build `main` ter-deploy otomatis
(`autoDeploy: true` di `render.yaml`), jadi setiap push ke `main` langsung
memperbarui versi online. Free tier tidur setelah tidak dipakai; kunjungan
pertama bisa lambat beberapa detik.

> **Asisten Fisika di server online:** tambahkan Environment Variable
> `HELIPOD_API_KEY` pada layanan Render agar chatbot bisa menjawab. Tanpa key,
> panel asisten menampilkan pesan belum dikonfigurasi dan fitur lain tetap
> normal. Lihat [Asisten Fisika](#asisten-fisika-chatbot).

**Native Android + online.** Tekan **Download APK Android**, pasang di HP, lalu
alamat server online sudah terisi otomatis (ubah lewat ikon gerigi bila perlu).
APK di-build otomatis oleh GitHub Actions setiap push ke `main` dan diunggah ke
halaman
[Releases](https://github.com/raffsyahputra3-sys/tolongmastokennyaabis/releases).

Dokumen produk lengkap ada di [PRD.md](./PRD.md).

## Menjalankan

Prasyarat: Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env   # opsional: isi variabel yang dibutuhkan
npm test
npm run check
npm start
```

- `npm start` menjalankan server lokal lalu membuka aplikasi Electron.
- `npm run server` hanya menjalankan server di `http://127.0.0.1:8787`.
- `npm run desktop` membuka Electron yang terhubung ke server yang sudah berjalan.
- `npm run check` memeriksa sintaks, kelengkapan file, bank soal, dan manifest.
- Port dapat diubah dengan `PORT=9000 npm start`.

Tanpa Electron, client juga dapat dibuka di browser melalui
`http://127.0.0.1:8787`. Health check tersedia di `/healthz`.

**Konfigurasi.** Semua environment variable bersifat opsional (asisten AI dan akun
pemain otomatis nonaktif bila tidak diisi). Daftar lengkap beserta nilai bawaannya
ada di [`.env.example`](./.env.example); nilainya dapat diisi lewat shell
(mis. `PORT=9000 npm start`) atau dashboard hosting (Render > Environment). Cara
mengaktifkan Asisten Fisika dijelaskan di [bagian asisten](#asisten-fisika-chatbot)
dan akun pemain di [bagian akun](#menyiapkan-supabase).

## Server online

Pemain dan APK butuh satu server game yang bisa dijangkau dari internet.

### A. Pakai server yang sudah online (langsung main)

Buka **https://gatravolt.onrender.com** di browser, atau tempel
alamat itu di aplikasi (ikon gerigi > **Alamat server**). Server ini juga
menjadi alamat bawaan APK (`wss://gatravolt.onrender.com`), jadi
APK yang di-build dari workflow ini langsung tersambung tanpa disetel lagi.

### B. Deploy sendiri di Render (gratis, tombol Deploy)

1. Tekan tombol **Deploy Server Online** di atas, lalu login Render.
2. Render membaca `render.yaml` di repo ini dan menjalankan `npm run server`.
3. Setelah selesai, salin URL `https://nama-layanan.onrender.com`.
4. Tempel URL itu di aplikasi (ikon gerigi > **Alamat server**), atau set
   **repository variable** `LOGICODIX_DEFAULT_SERVER` di GitHub (Settings >
   Secrets and variables > Actions > Variables), lalu jalankan ulang workflow
   **Android APK** agar APK berikutnya otomatis terhubung.

> Free tier Render tidur setelah tidak dipakai; kunjungan pertama bisa lambat
> beberapa detik. WebSocket tetap didukung.

### C. Link publik sementara (tanpa daftar)

Jalankan di komputer:

```bash
npm run online
```

Perintah ini menyalakan server game lalu membuat **link publik HTTPS** (mis.
`https://namacakal.trycloudflare.com`) yang bisa dibuka dari HP/laptop mana pun
dan di jaringan mana pun. Bagikan link itu ke teman, lalu pilih **CARI LAWAN**
atau **BUAT ROOM**.

- `cloudflared` diunduh otomatis sekali, lalu tersimpan di `tools/` (tidak ikut git).
- Biarkan terminal tetap terbuka selama bermain; menutupnya mematikan server.
- Link berubah setiap kali dijalankan ulang, jadi bagikan link yang baru.
- APK juga bisa memakai link ini: tempel di **Alamat server** (boleh `https://`).

## Mode bermain (tim 3v3, online)

Dua tim berisi maksimal 3 pemain: **Samudra** dan **Merapi**. Ada dua cara masuk
pertandingan:

| Mode | Cara | Keterangan |
|---|---|---|
| Matchmaking | **CARI LAWAN** di lobi | Server mempertemukan pemain online. Slot kosong diisi bot. |
| Room privat | **BUAT ROOM** lalu bagikan kode | Teman memilih **GABUNG** dan memasukkan kode room. |

Semua pemain terhubung ke server yang sama lewat WebSocket, jadi pertandingan
berjalan real-time antar perangkat. Agar bisa dimainkan lintas internet, pakai
server publik dari bagian [Server online](#server-online) (tombol Render atau
`npm run online`), lalu semua pemain mengarahkan client ke alamat server
tersebut. Sinyal tim (ketuk minimap) dan lineup kedua tim tersedia sepanjang
pertandingan.

**Kuis menara.** Menembak **menara** lawan juga membuka soal (bank soal fisika
tingkat pemula, **tanpa batas waktu**; ikon `∞`). Menjawab benar meloloskan
damage ke menara, menjawab salah membuat serangan gagal plus perlambatan, dan
tombol **KELUAR** membatalkan serangan tanpa menghabiskan amunisi. Bank soal ada
di `shared/turretQuestions.js`.

## Belajar fisika: Materi, Latihan, dan Latihan Harian

Panel **BELAJAR FISIKA** ada di posisi paling atas lobi, berisi tombol **MATERI**,
**LATIHAN**, dan **🤖 ASISTEN FISIKA**. Semuanya berjalan di client dan tidak
mengubah jalannya pertandingan. Tingkat soal (Pemula / Menengah / Mahir) diatur
dari ikon gerigi > **Pengaturan > TINGKAT FISIKA**.

| Fitur | Isi |
|---|---|
| **MATERI** | Ringkasan fisika interaktif per bab: topik, rumus, contoh, kalkulator, dan kuis singkat. Progres tersimpan di perangkat. |
| **LATIHAN** | Kuis per materi dengan nilai, ambang ketuntasan, status **tuntas/remedial**, dan skor terbaik. |
| **ASISTEN FISIKA** | Chatbot AI: tanya materi atau kirim foto soal. Hemat token (retrieval 3 topik + template jawaban) dan hanya menjawab dari materi game. |
| **Latihan Harian** | 5 soal baru setiap hari dengan pengingat di lobi dan runtutan (streak) hari berturut-turut. |

Detail tiap fitur ada di `PRD-MATERI.md`, `PRD-LATIHAN.md`, dan
`PRD-DAILY-LATIHAN.md`.

### Asisten Fisika (chatbot)

Asisten memanggil model **Qwen VL (OCR)** lewat gateway Helipod, tetapi:

- API key **tidak pernah** dikirim ke browser. Client memanggil `POST /api/asisten`
  di server game, dan server menambahkan key dari variabel lingkungan.
- Server hanya meneruskan potongan materi yang relevan: materi dipecah menjadi
  37 chunk (satu per topik) dan maksimal 3 chunk teratas ikut dikirim, bukan
  seluruh 6 bab. Rata-rata system prompt turun dari 11.414 karakter (materi
  penuh) menjadi ~2.200 karakter.
- Jenis pertanyaan diklasifikasi di client (konsep, rumus, hitungan, bergambar,
  di luar materi, tidak jelas) sehingga panjang dan suhu jawaban menyesuaikan.
- Jawaban identik tanpa gambar dilayani dari `localStorage` (awalan `fisbot:`),
  ada tombol **Jawab ulang** untuk memaksa panggilan baru.
- Pertanyaan tak jelas dijawab lokal tanpa API. Mode debug: buka
  `?asistenDebug=1`, atau set `localStorage["fisbot:debug"] = "1"`.
- Panel asisten memanggil `/api/asisten` di server game. Di **APK native** halaman
  dilayani dari perangkat (`http://localhost`), jadi client memakai alamat absolut
  dari `serverHttpBase()` di `client/net.js`, dan server mengirim header CORS
  sekaligus menjawab preflight `OPTIONS`.

**Cara membuka:** avatar rubah **Fisiko** di lobi (pojok kanan-bawah panggung
hero, di dekat karakter game) atau tombol **🤖 ASISTEN FISIKA** pada panel
BELAJAR FISIKA. Maskotnya punya tiga keadaan (diam, berpikir, bicara) dan balon
bicara, sehingga gampang terlihat tanpa harus membuka menu.

Konfigurasi server (bukan di client):

| Variabel | Fungsi |
|---|---|
| `HELIPOD_API_KEY` | Kunci gateway Helipod. Bila kosong, server mencoba berkas `~/.helipod_key`, lalu menjawab bahwa asisten belum dikonfigurasi. |
| `HELIPOD_MODEL` | Model yang dipakai. Bawaan `qwen-vl-ocr`. |
| `HELIPOD_BASE_URL` | Bawaan `https://ai.helipod.io/v1`. |

> Asisten adalah fitur opsional: kalau key belum diisi, game tetap berjalan dan
> panelnya hanya menampilkan pesan belum dikonfigurasi.

## Akun pemain (opsional)

Akun pemain dipakai untuk menyimpan nama tampilan dan progres belajar lintas
perangkat. Fitur ini **opsional**: tanpa mengisinya, game tetap jalan penuh
sebagai tamu. Ada juga tombol **MASUK** di bilah atas untuk daftar/masuk.

Prinsip etis yang dipegang:

- **Data minimal** — hanya email, nama tampilan, dan progres belajar.
- **Consent eksplisit** — pendaftaran wajib mencentang Kebijakan Privasi dan
  konfirmasi batas usia (13+ atau izin orang tua/wali).
- **Hak hapus & ekspor** — tombol _Ekspor_ (JSON) dan _Hapus_ di menu Akun.
  Penghapusan permanen dan menyeluruh.
- **Anti-enumerasi** — pesan galat disamakan agar tidak membocorkan email terdaftar.
- **RLS** — setiap akun hanya bisa membaca/menulis barisnya sendiri.
- Tanpa iklan dan tanpa penjualan data.

### Menyiapkan Supabase

1. Buat proyek di <https://supabase.com>.
2. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu **Run**. Berkas
   ini membuat tabel `profiles` & `daily_progress`, aturan RLS, trigger profil
   otomatis, dan fungsi `delete_my_account()`.
3. Salin **Project URL** dan **anon key** dari **Settings → API**.
4. Buka **Authentication → URL Configuration**, isi **Site URL** dengan alamat
   game (mis. `https://gatravolt.onrender.com`) dan tambahkan alamat
   yang sama ke **Redirect URLs**. Tanpa ini, tautan verifikasi email akan
   mengarah ke `http://localhost:3000` dan tidak bisa dibuka.
5. Isi sebagai environment variable server game:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `SUPABASE_URL` | ya | Project URL, mis. `https://xxxx.supabase.co`. |
| `SUPABASE_ANON_KEY` | ya | Anon key (aman di sisi klien). |
| `SUPABASE_SERVICE_ROLE_KEY` | tidak | Jalur cadangan hapus/ekspor di server. RPC `delete_my_account()` sudah cukup tanpa ini. |
| `SUPABASE_JWT_SECRET` | tidak | Hanya bila proyek memakai penandatanganan HS256. |

Setelah dua variabel wajib terisi dan server dijalankan ulang, tombol MASUK
aktif. Tanpa keduanya, dialog hanya menampilkan catatan "belum diaktifkan" dan
semua pemain bermain sebagai tamu.

Bila **confirm email** aktif, tautan verifikasi membawa pengguna kembali ke halaman
game dan langsung masuk ke akunnya. Kalau ingin pendaftaran tanpa verifikasi
(email lebih cepat untuk lomba), matikan **Confirm email** di
**Authentication → Sign In / Providers → Email**.

## Menghubungkan server internet

Cara paling mudah adalah menekan tombol **Deploy Server Online** di atas; Render
membaca `render.yaml` dan menjalankan server dengan TLS otomatis. Bagian ini
untuk hosting manual/VPS.

Server produksi harus berada di belakang TLS (`wss://`). Set alamat server pada
kolom **Pengaturan > Alamat server WebSocket** di aplikasi, atau melalui query
`?server=wss://domain.example`. Variabel lingkungan yang dipakai:

| Variabel | Fungsi |
|---|---|
| `PORT` | Port HTTP/WebSocket server lokal. |
| `LOGICODIX_SERVER_URL` | URL WebSocket yang diberikan ke client Electron. |
| `LOGICODIX_CLIENT_URL` | URL HTTP tempat Electron memuat aset client. |

Contoh menjalankan client desktop terhadap server internet:

```bash
LOGICODIX_SERVER_URL=wss://arena.example npm start
```

Server menyajikan aset statis dan WebSocket pada proses yang sama. Untuk produksi,
gunakan reverse proxy (Caddy/Nginx), health check `/healthz`, dan proses manager
seperti systemd atau container orchestrator.

## Lihat tampilan HP di laptop

`npm run phone` membuka jendela berukuran ponsel (915x412, landscape) lengkap dengan HUD dan kontrol sentuh; **mouse bertindak sebagai jari** (seret joystick, seret tombol serang atau Dash untuk membidik, ketuk minimap untuk sinyal). Pintasan: **F2** putar potret/landscape, **F3** ganti ukuran ponsel, **F12** DevTools.

## Instalasi di HP (Android / iPhone)

### Android — APK native (tombol download)

1. Tekan tombol **Download APK Android** di bagian atas README (atau buka halaman
   [Releases](https://github.com/raffsyahputra3-sys/tolongmastokennyaabis/releases)).
2. **Hapus dulu** aplikasi GatraVolt yang lama. Kunci debug dibuat ulang di setiap
   build, jadi memasang di atas versi lama akan gagal (*"App not installed"*).
3. Buka file `GatraVolt.apk` di HP. Bila muncul peringatan, aktifkan **Izinkan
   dari sumber ini** / **Instal aplikasi tidak dikenal**.
4. Buka aplikasi **GatraVolt**. Alamat server online sudah terisi otomatis; ubah
   lewat ikon **gerigi** bila perlu.
5. Masuk lewat **CARI LAWAN** (matchmaking) atau **BUAT ROOM** lalu bagikan kode
   ke teman.

APK di-build otomatis oleh GitHub Actions (debug-signed, cukup untuk dipasang
manual di HP). iPhone tidak bisa memasang APK; gunakan PWA di bawah.

### Android / iPhone — PWA tanpa APK

1. Buka link publik game (dari server Render atau `npm run online`) di browser HP.
2. Pasang ke layar utama:
   - **Android Chrome:** menu **⋮ > Tambahkan ke layar utama** (atau **Instal
     aplikasi** bila muncul).
   - **iPhone Safari:** tombol **Bagikan > Tambahkan ke Layar Utama**.
3. Buka game dari ikon di layar utama. Game berjalan layar penuh dan terkunci
   **landscape**; putar HP mendatar.
4. Masuk lewat **CARI LAWAN** (online) atau **BUAT ROOM** lalu bagikan kode ke
   teman.

> Mode terpasang penuh (tanpa bilah alamat) hanya aktif bila alamat memakai
> **HTTPS**. Server Render dan link `npm run online` sudah HTTPS, jadi langsung
> bisa dipasang penuh. Lewat `http://` biasa game tetap bisa dimainkan penuh di tab.

## Main di Android

Game berjalan di Chrome Android sebagai web app (PWA); tidak perlu build APK.
Cara termudah adalah `npm run online` (link publik, tanpa satu Wi-Fi). Langkah di
bawah ini adalah alternatif lokal satu Wi-Fi.

1. Di komputer: `npm run server`. Server mencetak alamat seperti
   `Android/HP di jaringan yang sama: buka http://192.168.1.20:8787`.
2. HP dan komputer harus satu Wi-Fi. Izinkan Node.js di Windows Firewall
   (jaringan privat) bila halaman tidak terbuka.
3. Buka alamat itu di Chrome HP. Tekan tombol layar penuh (ikon kotak di kanan
   atas) atau cukup tekan **MAIN**; game masuk layar penuh dan mengunci landscape.
4. Menu Chrome, lalu **Tambahkan ke layar utama** untuk ikon sendiri.
   Mode terpasang penuh (WebAPK, tanpa bilah alamat) hanya ditawarkan Chrome pada
   HTTPS. Untuk itu pasang server di belakang TLS (Caddy/Nginx) atau pakai
   terowongan HTTPS (mis. `cloudflared tunnel --url http://localhost:8787`).
   Lewat HTTP biasa game tetap berjalan penuh di tab.

Kontrol sentuh: joystick kiri-bawah untuk bergerak; tombol serang besar di
kanan-bawah: **tap** menembak ke musuh terdekat (bidik otomatis), **seret**
tombolnya untuk membidik manual. Tiga tombol bulat di sekitarnya: Dash, Pulse,
Super. **Dash dan Super bisa diseret** untuk membidik: geser jari ke arah yang diinginkan lalu lepas (garis kuning menunjukkan arah); geser terlalu jauh dari tombol lalu lepas untuk membatalkan. Tap biasa memakai skill ke arah bidik otomatis. Bidik otomatis dapat dimatikan di Pengaturan.

**Sinyal tim:** ketuk minimap (kiri-atas) untuk memanggil rekan "Ayo ke sini", tekan lama untuk "Bahaya". Rekan manusia melihat penanda di peta dan arena; bot rekan ikut bergerak ke titik panggilan. Jeda 1,5 detik per pemain.

Alur layar: Lobi, Matchmaking atau Room, **Pilih Hero** (25 detik, pre-pick,
kunci pilihan, hero lawan tersembunyi), Loading (lineup kedua tim), Pertandingan,
Hasil (MVP dan papan skor, tombol **Main Lagi** di kanan-bawah).

## APK Android native (Capacitor)

APK siap pasang tersedia di
[Releases](https://github.com/raffsyahputra3-sys/tolongmastokennyaabis/releases)
(tag `android-latest`). Build
otomatis lewat GitHub Actions (`.github/workflows/android.yml`) setiap push ke
`main`; hasilnya juga diunggah sebagai artifact **GatraVolt-apk**.

Proyek Android lengkap ada di `android/` (paket `com.logicodix.momentumarena`).
Aplikasi membungkus client web di WebView native: layar penuh immersive, terkunci
landscape, layar tidak padam saat bermain, tombol Kembali Android diarahkan ke menu
game, ikon dan splash sendiri. Game server tetap berjalan di komputer/VPS.

Kalau ingin APK otomatis terhubung ke server tertentu, set repository variable
`LOGICODIX_DEFAULT_SERVER` (mis. `https://gatravolt.onrender.com`)
di GitHub sebelum build. Tanpa variable ini, APK native tetap memakai alamat
bawaan `wss://gatravolt.onrender.com` (lihat `client/net.js`).
Aplikasi juga tetap bisa mengganti alamat lewat ikon gerigi.

Yang dibutuhkan untuk build lokal (tidak ikut di repo): **Android Studio**
(membawa JDK 21 dan Android SDK). Capacitor 8 memakai compileSdk 36.

```
npm run android:sync     # salin client ke www/ lalu sinkronkan ke proyek Android
npm run android:open     # buka di Android Studio, lalu Build > Build APK(s)
```

Atau lewat terminal (setelah `JAVA_HOME` dan `ANDROID_HOME` diatur):

```
npm run android:apk      # hasil: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Pertama kali dibuka, aplikasi meminta **alamat server**: isi URL server online
(`https://...` atau `wss://...`) dari bagian [Server online](#server-online).
Untuk jaringan lokal bisa juga `ws://IP-KOMPUTER:8787` (emulator Android memakai
`ws://10.0.2.2:8787`). Alamat tersimpan; ubah lewat ikon gerigi. Cleartext
`ws://` diizinkan di manifest agar jaringan lokal berfungsi. Untuk rilis Play
Store gunakan `wss://` dan tanda tangani build release.

Setiap kali client web berubah, jalankan `npm run android:sync` lagi sebelum build.

## Notifikasi pertempuran dan health bar

- **Health bar hero** di arena: hijau untuk kamu dan rekan, merah untuk lawan, bingkai
  emas untuk dirimu, garis skala tiap 50 HP, kilatan putih saat terkena, dan bingkai
  berdenyut saat HP kritis. Angka damage melayang muncul untuk serangan yang melibatkanmu.
- **Panel HP** (kamu dan lawan terdekat) menampilkan angka HP, warna yang berubah
  (hijau, kuning, merah), dan jejak putih-kuning yang memperlihatkan HP yang baru hilang.
- **Notifikasi** di atas panel HP-mu: `DISERANG <nama/menara/minion> -N` (merah) dan
  `MENGENAI <nama> -N` (kuning). Serangan beruntun dijumlahkan (`x3`). Saat diserang
  hero lawan muncul panah arah penyerang dan kilatan merah di tepi layar; saat HP
  turun ke 30% muncul peringatan HP kritis.

## Minion

Minion mengikuti tema faksi: **Samudra** = prajurit pesisir biru-teal (ikat kepala biru, kain
pendek, tombak/trisula atau busur, tameng kerang) dan **Merapi** = prajurit gunung merah-emas
(ikat kepala merah, rompi dan sabuk, pedang pendek atau busur api, tameng kayu). Perbedaan
tim terbaca lewat bentuk, bukan hanya warna. Tiap lane berisi dua petarung dan satu pemanah
(varian visual; statistik sama). Minion berjalan dengan goyangan, mengayun senjata saat
menyerang, dan menyusut saat mati. Tier efek **Ringan** memakai model minion sederhana.
Config tampilan ada di `shared/minions.js`; aset visual seluruhnya prosedural (lihat `CREDITS.md`).

## Efek kartu karakter di lobi

Potret hero di lobi punya efek khas sesuai legenda: bara emas dan bulu merak (Warok
Suro), riak peta dan ombak emas (Patih Gajah), api dan kabut ungu (Leak Bali),
gelembung dan mutiara (Nyi Roro), daun dan kunang-kunang hutan (Sipet Dayak), serta
hujan dan asap dupa (Pawang Hujan). Kartu hero yang terpilih di sisi kanan ikut
beranimasi. Tombol **SHOWCASE** memutar sorotan 3,6 detik: pose menyerang, ledakan
partikel, cincin energi, nama ultimate, dan (sesuai pengaturan Efek layar) kilatan,
getar, serta jumpscare. Showcase otomatis saat ganti hero hanya memakai partikel.
Kepadatan partikel mengikuti level (Kalem/Normal/Ganas) dan tier kualitas.

## Efek layar (ultimate)

Saat memakai ultimate, layar mendapat grading warna, kilatan singkat, jumpscare
kecil, dan getar sesuai hero, lengkap dengan stinger audio. Atur di ikon gerigi >
**Efek layar**: intensitas **Kalem / Normal / Ganas** (bawaan Normal; jumpscare hanya di Ganas), kualitas
**Auto / Penuh / Sedang / Ringan**, toggle kilatan, jumpscare, getar layar beserta
kekuatannya, dan tombol **COBA** untuk melihat efek hero terpilih. Mode Auto
menurunkan kualitas bila FPS di bawah 25 selama 3 detik, dan pengaturan
`prefers-reduced-motion` mematikan kilatan, getar, dan jumpscare. Efek murni visual:
tidak mengubah gameplay. Config per hero ada di `shared/fx.js`.

## Kontrol

| Aksi | Keyboard / Mouse |
|---|---|
| Gerak | `WASD` / panah / joystick di layar |
| Serang | Klik kiri / `J` / tombol serang |
| Dash | `Space` |
| Shockwave | `R` |
| Super | `E` |
| Jawab soal | `1`–`4` atau klik opsi |
| Pengaturan | Ikon gerigi / status server |

**Kuis menara.** Saat kamu membidik menara lawan, tembakan ditahan dan muncul satu
soal fisika singkat. Jawaban benar memberi damage besar ke menara; jawaban salah
membuatmu kena Momentum Loss kecil. Kuis ini dipicu lewat aksi SERANG SOAL (`F` /
tombol SOAL). Semua angka ada di `DUEL` pada `shared/constants.js`.

**Kuis hidup kembali.** Saat tumbang, pemain manusia tidak menunggu timer: hidup
kembali dengan menjawab `REVIVE.questions` soal fisika dengan benar (lihat `REVIVE`
di `shared/constants.js`). Bot dan pemain yang terputus (AI takeover) tetap memakai
timer `MATCH.respawn`. Server menyimpan kunci jawaban dan memvalidasi ID kuis.

## Arsitektur dan alur data

```
Browser / PWA ─┐
APK Android ───┼── WebSocket (ws/wss) ──> Node.js authoritative server
Electron ──────┘                              ├─ room / matchmaking
                                              ├─ simulasi fisika 30 Hz
                                              ├─ validasi kuis menara + kuis hidup kembali
                                              ├─ AI takeover + reconnect 60 detik
                                              ├─ POST /api/asisten ──> Helipod AI gateway
                                              └─ Supabase (Auth + Postgres, opsional)
```

**Alur data satu pertandingan:**

1. Client terhubung ke server (`ws`) dan memilih **CARI LAWAN** / **BUAT ROOM**; server menyusun tim dan mengisi slot kosong dengan bot.
2. Saat match berjalan, client mengirim **input** (bitmask gerak/ability + arah aim) ~30–60 kali per detik.
3. Server menjalankan fisika & combat 30 Hz dan menyiarkan **snapshot state** 15 Hz ke semua pemain.
4. Kuis (menara/hidup kembali) dikirim ke satu pemain; jawaban divalidasi **hanya di server** (kunci jawaban tidak pernah dikirim saat kuis aktif).
5. Pemain terputus → server mengaktifkan **AI takeover**; saat kembali dalam 60 detik, sesi dipulihkan dengan token.

- `client/main.js` — UI, lobby, HUD, overlay kuis, hasil match, reconnect.
- `client/render.js` / `client/render3d.js` — renderer arena 2D dan 3D serta portrait hero.
- `client/net.js` — WebSocket, heartbeat, exponential backoff, resume sesi, alamat server bawaan.
- `client/input.js` — keyboard, mouse, joystick, latch ability.
- `client/fx.js` / `client/lobbyfx.js` / `client/audio.js` — efek layar ultimate, efek kartu hero di lobi, dan audio.
- `client/materi.js`, `client/latihan.js`, `client/daily-latihan.js` — modul belajar fisika (materi, latihan, latihan harian).
- `client/asisten.js`, `client/asisten-data.js` — Asisten Fisika: retrieval chunk, klasifikasi jenis pertanyaan, template jawaban, cache, dan overlay chat.
- `server/index.js` — HTTP statis, health check, rate limit, routing pesan, dan proxy `/api/asisten`.
- `server/room.js` — state room, fisika, combat, kuis menara, kuis hidup kembali, disconnect/reconnect.
- `server/bot.js` — AI takeover dan jawaban bot dengan akurasi terbatas.
- `shared/` — konstanta, hero, fisika, minion, efek, bank soal, dan bank soal menara.

## Video demo

> ⏳ **TODO:** tautan video demo belum tersedia. Ganti baris ini dengan URL video
> (YouTube/Drive) sebelum submit. Durasi mengikuti ketentuan lomba.

## Pengujian

```bash
npm test
npm run check
```

- `test/physics.test.js` — rumus momentum, energi, tabrakan, pantulan, limit.
- `test/questions.test.js` — validasi bank soal dan tingkat kesulitan.
- `test/room.test.js` — jawaban valid/duplikat, Momentum Loss, AI takeover, dan
  reconnect.
- `test/turret.test.js` / `test/respawn.test.js` — kuis menara dan kuis hidup
  kembali.
- `test/combat.test.js` / `test/balance.test.js` — combat dan keseimbangan hero.
- `test/minions.test.js` / `test/fx.test.js` / `test/lobbyfx.test.js` — minion,
  efek layar, dan efek kartu lobi.
- `test/asisten.test.js` — pemilihan chunk, klasifikasi jenis pertanyaan, dan
  penghematan panjang system prompt Asisten Fisika.

## Akun demonstrasi

Autentikasi memakai **Supabase** dan bersifat **opsional**. Untuk mencoba aplikasi,
juri **tidak perlu akun sama sekali** — cukup buka
<https://gatravolt.onrender.com>, lalu tekan **CARI LAWAN** atau
**BUAT ROOM** dan bermain sebagai tamu dengan fitur penuh. Tombol **MASUK** hanya
untuk menyimpan nama tampilan dan progres belajar lintas perangkat.

## Variabel lingkungan (.env.example)

Seluruh variabel bersifat **opsional**; tanpa diisi, game tetap berjalan penuh dan
hanya asisten AI / akun pemain yang nonaktif. Daftar lengkap beserta nilai
bawaannya ada di [`.env.example`](./.env.example). Isi nilai lewat environment
variable shell (mis. `PORT=9000 npm start`) atau lewat dashboard penyedia hosting
(Render > Environment). Berkas `.env` **tidak** dimuat otomatis oleh server.

| Variabel | Fungsi |
|---|---|
| `PORT` | Port HTTP/WebSocket server lokal (bawaan 8787). |
| `LOGICODIX_SERVER_URL` | URL WebSocket yang diberikan ke client Electron. |
| `LOGICODIX_CLIENT_URL` | URL HTTP tempat Electron memuat aset client. |
| `LOGICODIX_PHONE` | Set `1` untuk jendela berukuran ponsel (`npm run phone`). |
| `LOGICODIX_DEFAULT_SERVER` | Alamat server bawaan yang ditanam ke APK saat build. |
| `HELIPOD_API_KEY` | Kunci gateway Helipod untuk Asisten Fisika (fallback `~/.helipod_key`). |
| `HELIPOD_MODEL` | Model AI (bawaan `qwen-vl-ocr`). |
| `HELIPOD_BASE_URL` | Base URL gateway Helipod (bawaan `https://ai.helipod.io/v1`). |
| `SUPABASE_URL` | Project URL Supabase untuk akun pemain. |
| `SUPABASE_ANON_KEY` | Anon key Supabase (aman di sisi klien). |
| `SUPABASE_SERVICE_ROLE_KEY` | Cadangan hapus/ekspor di server (tidak wajib). |
| `SUPABASE_JWT_SECRET` | Hanya bila proyek memakai penandatanganan HS256. |

## Keamanan dan batasan MVP

- Server otoritatif: client hanya mengirim bitmask input dan arah aim.
- Kunci jawaban tidak pernah dikirim selama kuis aktif.
- Payload WebSocket dibatasi 16 KB dan rate limit 700 pesan/10 detik.
- Electron memakai context isolation, sandbox, tanpa `nodeIntegration`, dan
  navigasi keluar dibatasi.
- Sesi reconnect memakai token acak dan grace period 60 detik.
- Format pertandingan 3v3 tiga lane, 6 hero, 8 menit per match; slot kosong diisi
  bot. Item shop, rank, dan fog of war ada di roadmap PRD.

## Atribusi

- **Aset visual & audio:** seluruh model hero/minion, efek, dan suara dibuat
  **prosedural lewat kode** (Three.js, Canvas 2D, Web Audio). Tidak ada gambar,
  sprite, model, atau berkas audio pihak ketiga yang disertakan.
- **Pustaka:** [Three.js](https://threejs.org/) (MIT) dan
  [`ws`](https://github.com/websockets/ws) (MIT). Lisensi Three.js ada di
  `assets/vendor/three.LICENSE`.
- **Template:** tidak memakai template pihak ketiga; tata letak dan gaya ditulis
  sendiri.
- **Dataset:** bank soal fisika disusun sendiri (`shared/questions.js`,
  `shared/turretQuestions.js`); tidak memakai dataset publik.
- Rincian dan aturan menambah aset ada di [CREDITS.md](./CREDITS.md).
- **Layanan pihak ketiga:** Render (hosting), Supabase (auth + database, opsional),
  Helipod (gateway AI, opsional), Cloudflare (tunnel sementara), GitHub Actions.



