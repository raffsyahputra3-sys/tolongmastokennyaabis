# PRD — Logicodix: Momentum Arena

**Versi:** 2.0 (desain game)  
**Tanggal:** 25 Oktober 2026 (diperbarui 14 November 2026)  
**Status:** Implementasi (3v3 tiga lane)  
**Genre:** MOBA fisika real-time + kuis soal  
**Durasi match:** 8 menit atau sampai Nexus hancur  
**Mode:** 3v3 online (matchmaking / room privat) dan latihan vs AI

> Dokumen ini fokus pada **desain game**: loop, fisika, hero, peta, soal, dan
> perilaku bot. Urusan teknis (web, server, jaringan, deploy, aplikasi native)
> sengaja tidak dibahas di sini — semuanya ada di [README.md](./README.md).

---

## 1. Ringkasan Produk

Logicodix: Momentum Arena adalah MOBA **3v3** real-time di mana gerak,
pertempuran, dan kerusakan mengikuti hukum fisika, sementara pengetahuan fisika
menjadi mekanik tempur. Setiap pemain mengendalikan satu hero, bekerja sama
dengan dua rekan di tiga lane, menghancurkan menara dan Nexus lawan.

Berbeda dari kuis terpisah, soal muncul **di dalam pertempuran** dan hanya lewat
dua jalur: menyerang menara dan hidup kembali setelah tumbang. Jawaban benar
memberi hasil nyata (damage besar / hidup kembali); jawaban salah memberi penalti
**Momentum Loss**. Semua soal **wajib bertema fisika**, dan mekanik inti juga
memakai konsep fisika (momentum, impuls, tumbukan, proyektil).

### Sasaran

1. Membuktikan bahwa soal fisika dapat terasa bagian dari combat, bukan gate yang
   menghentikan permainan.
2. Menyediakan match **3v3 tiga lane** yang terasa seperti MOBA sungguhan.
3. Menjaga pertandingan tetap seru ketika pemain disconnect melalui **AI takeover**
   dan reconnect.
4. Menyediakan modul belajar opsional (Materi, Latihan, Latihan Harian) dan
   Asisten Fisika sebagai jembatan dari bermain ke belajar.

### Non-sasaran

- 5v5, ranked season, skin, toko, clan, dan matchmaking MMR penuh.
- Jungle monster, objective netral (Turtle/Lord), item shop, fog of war.
- Voice chat, anti-cheat kernel-level, dan monetisasi.

---

## 2. Keputusan Desain Final

| Pertanyaan | Keputusan | Alasan |
|---|---|---|
| Format tim | **3 lawan 3** | Terasa MOBA, bukan duel dua menara. Seat kosong diisi bot. |
| Jenis soal | **100% fisika** | Identitas produk. |
| Kapan soal muncul | **Hanya lewat aksi pemain** (kuis menara) dan **saat tumbang** (kuis hidup kembali) | Soal jadi pilihan, bukan gangguan terjadwal. |
| Mode tanpa soal | **Tidak ada** untuk menara; serangan biasa tetap bisa merusak menara (damage kecil) | Memberi pilihan tempo: aman tapi lambat, atau menjawab soal untuk damage besar. |
| Penalti jawaban salah | **Momentum Loss**: kecepatan × 0.95 selama 2 detik | Risiko nyata, tidak langsung mematikan. |
| Hidup kembali | **Manusia lewat kuis 2 soal** (tanpa batas waktu); bot & AI takeover lewat timer 6 detik | Pemain aktif "membayar" kebangkitan dengan pengetahuan. |
| Kesulitan | Pilihan pemain (Pemula/Menengah/Mahir) di lobby untuk soal menara; kuis hidup kembali memakai soal Pemula | Soal pemula gampang dijawab saat panik; soal menara mengikuti level room. |
| Disconnect | **AI takeover langsung + grace reconnect 60 detik** | Rekan tetap bisa bermain; slot tidak hilang. |
| Komunikasi tim | Sinyal minimap (ketuk = "ke sini", tahan = "bahaya") | Cukup untuk koordinasi tanpa chat. |

---

## 3. Pilar Pengalaman

1. **Fisika terasa, bukan ditempel.** Serangan adalah proyektil bermassa, dash
   memberi impuls, dinding memantulkan, cover hancur oleh energi tumbukan, dan
   ledakan mendorong benda.
2. **Pengetahuan = kekuatan taktis.** Jawaban benar mengubah pertempuran dan
   menghancurkan menara, bukan hanya menambah skor di akhir.
3. **Soal itu pilihan.** Pemain yang tidak mau menjawab tetap bisa bermain —
   hanya lebih lambat.
4. **Entry-level, ceiling tinggi.** Soal Pemula dapat dijawab tanpa kalkulator;
   soal Mahir menuntut penalaran vektor dan momentum.
5. **Tidak pay-to-win.** Semua hero dan soal dapat diakses tanpa pembayaran.

---

## 4. Core Loop

1. Pemain masuk lobby, memilih nama, hero, dan tingkat fisika.
2. Pilih **CARI LAWAN**, **BUAT ROOM**, atau **latihan vs AI**.
3. **Champion Select** (25 detik): pre-pick, kunci hero, hero lawan disembunyikan.
4. Loading menampilkan lineup dan tips, lalu countdown.
5. Match berjalan: minion berjalan di tiga lane, pemain farming, bertempur, dan
   menghancurkan menara.
6. Saat pemain membidik menara lawan dan menekan **SERANG SOAL**, muncul satu soal;
   jawaban benar = damage besar ke menara.
7. Saat tumbang, pemain manusia menjawab **2 soal** untuk hidup kembali.
8. Hancurkan menara lalu Nexus lawan, atau menang lewat skor saat waktu habis.

### Alur match 8 menit

| Waktu | Event |
|---|---|
| 0:00 | Countdown selesai, hero spawn di dekat Nexus. |
| 0:02 | Gelombang minion pertama di tiga lane. |
| Sepanjang match | Minion wave tiap 14 detik; menara, cover, minion, hero, dan proyektil berinteraksi dengan fisika. |
| Kapan pun | Pemain dapat menyerang menara dengan soal (SERANG SOAL). |
| Kapan pun | Pemain tumbang menjawab kuis hidup kembali. |
| Menit 8 | Waktu habis. Skor tertinggi menang; jika seri, Nexus dengan HP lebih tinggi menang. |
| Kapan pun | Nexus hancur = kemenangan instan. |

Skor tim = 100/kill + 180/menara + 10/jawaban benar.

---

## 5. Sistem Fisika

### 5.1 Model simulasi

Simulasi otoritatif berjalan 30 Hz. Arena adalah bidang 2D tanpa gravitasi global
(tampilan atas-bawah). Entitas memakai lingkaran untuk tabrakan; cover memakai
persegi panjang.

Besaran yang disimulasikan:

- Posisi, kecepatan, massa, radius.
- Gaya dorong (`impulse`) dari dash, ledakan, dan tumbukan.
- Momentum proyektil: `p = m × v`; damage skala dengan momentum.
- Tumbukan elastis sebagian dengan restitusi dan kehilangan energi.
- Kerusakan cover berdasarkan energi tumbukan.
- Cooldown, shield, refleksi, dan slow sebagai modifier.

### 5.2 Aturan yang dapat dirasakan pemain

| Mekanik | Konsep fisika | Efek gameplay |
|---|---|---|
| Basic attack | Proyektil, momentum | Proyektil bermassa; damage dan knockback naik seiring momentum. |
| Dash | Impuls, inersia | Menambah kecepatan sesaat; menabrak musuh/cover saat dash memberi impact damage. |
| Bertabrakan dengan cover | Tumbukan, restitusi | Hero memantul; cover kehilangan HP sesuai energi. |
| Shockwave | Gelombang, impuls radial | Mendorong hero/cover menjauh; makin dekat makin kuat. |
| Shield/refleksi | Refleksi (tumbukan lenting) | Proyektil yang mengenai shield/refleksi aktif dipantulkan. |
| Momentum Loss | Gesekan/rugi energi | Jawaban soal salah memperlambat kecepatan selama beberapa detik. |
| Amunisi | Batas energi tembakan | Maksimum 3 tembakan; mengisi ulang otomatis. |
| Minion/menara projectile | Gerak proyektil | Proyektil bisa memantul dari cover dan mengenai target lain. |

Semua angka gameplay dipisahkan di `shared/constants.js` dan `shared/heroes.js`.

---

## 6. Sistem Kuis (soal fisika)

Soal hanya muncul di dua jalur. Tidak ada soal terjadwal maupun duel antar-hero.

### 6.1 Kuis menara (aksi SERANG SOAL)

Pemain membidik menara lawan lalu menekan **SERANG SOAL** (`F` / tombol SOAL).

1. Syarat: menara lawan hidup, dalam jarak serang, dan ada dalam sudut bidik.
2. Muncul satu soal fisika sesuai tingkat room; jawaban divalidasi di server
   (kunci jawaban tidak pernah dikirim saat kuis aktif).
3. **Benar:** menara menerima damage sebesar damage hero (jauh lebih besar dari
   serangan biasa, yang hanya 35% dari damage hero).
4. **Salah:** terjadi **Momentum Loss** (kecepatan × 0.95 selama 2 detik) dan
   serangan gagal.
5. **KELUAR:** membatalkan serangan tanpa menghabiskan amunisi.
6. Satu kali percobaan memakai 1 amunisi.

Bank soal menara: `shared/turretQuestions.js`.

### 6.2 Kuis hidup kembali (respawn)

Saat pemain manusia tumbang, ia tidak menunggu timer.

1. Banner dan tombol **JAWAB SOAL** muncul; pemain menekan untuk mulai.
2. Server memberi `REVIVE.questions` (**2**) soal tingkat Pemula, satu per satu.
3. **Benar:** menambah progres. Setelah 2 jawaban benar, pemain **hidup kembali**
   di titik spawn dengan HP penuh.
4. **Salah:** progres tidak bertambah; soal baru diberikan (jeda ~2,4 detik).
5. Tidak ada batas waktu dan tidak ada penalti tambahan saat tumbang.
6. Bot dan pemain yang terputus (AI takeover) hidup otomatis lewat timer
   `MATCH.respawn` (6 detik).

### 6.3 Aturan dan anti-abuse

- Kunci jawaban hanya ada di server.
- Bank soal dipilih acak **tanpa pengulangan** sampai bank habis dalam satu match.
- Waktu jawaban divalidasi berdasarkan waktu server.
- Kuis berikutnya tidak dapat dipicu oleh client; jawaban untuk kuis lama/ID tidak
  valid ditolak.

---

## 7. Bank Soal dan Kurikulum

### 7.1 Prinsip

- Hanya fisika. Kategori: Momentum, Impuls, Tumbukan, dan Proyektil.
- Setiap soal memiliki: tingkat, kategori, empat opsi, indeks jawaban benar, dan
  penjelasan singkat.
- Soal harus **singkat dan langsung**: satu baris, satu konsep, bisa dibaca cepat
  dan dijawab dalam hitungan detik.
- Tingkat kesulitan:
  - **Pemula:** konsep dasar dan hitungan satu langkah.
  - **Menengah:** dua langkah, satuan, arah.
  - **Mahir:** vektor, momentum, energi, atau penalaran konseptual.

### 7.2 Contoh

| Level | Soal | Jawaban | Penjelasan |
|---|---|---|---|
| Pemula | Bola dilempar vertikal ke atas. Di titik tertinggi, besar kecepatannya? | 0 | Kecepatan sesaat nol sebelum berbalik arah. |
| Menengah | Gaya 10 N bekerja pada massa 2 kg. Percepatan? | 5 m/s² | Hukum II Newton: a = F/m. |
| Mahir | Dua gaya berlawanan 15 N dan 5 N pada benda 2 kg. Arah gerak? | Searah gaya 15 N | Resultan 10 N mengikuti gaya lebih besar. |

### 7.3 Kesulitan adaptif

Pemain memilih tingkat fisika di lobby. Kuis menara memakai tingkat room; kuis
hidup kembali selalu memakai soal Pemula agar tetap adil saat panik. Latihan
memakai tingkat pilihan pemain secara langsung.

---

## 8. Hero dan Combat

Setiap hero memiliki HP, massa, kecepatan, basic attack, Dash, Shockwave, dan
ultimate. Ultimate terisi saat memberi damage dan menumbangkan lawan (maksimum
100), lalu dipakai dengan tombol Super.

| Hero | Role | Ultimate dasar |
|---|---|---|
| Bastion | Tank | Aegis Field: shield + refleksi proyektil. |
| Vanguard | Fighter | Seismic Charge: dash besar + knockback. |
| Shade | Assassin | Blink burst: berpindah cepat + ledakan. |
| Ember | Mage | Nova api: proyektil area. |
| Quill | Marksman | Barrage: beberapa proyektil sekaligus. |
| Lumen | Support | Heal + shield untuk diri/rekan. |

Di mode 3v3, Lumen kembali menjadi healer tim.

### Progresi dalam match

- Minion memberi XP; hero dan menara memberi XP lebih besar.
- Level menambah HP maksimum, damage, dan sedikit kecepatan.
- Farming tetap relevan karena level dan push wave memengaruhi tempo.

---

## 9. Peta dan Objective

- Arena **2600 × 1500** dengan **tiga lane**: atas (Selat Malaka), tengah (Jalan
  Raya Pos), bawah (Jalur Sutra Maritim), dan jungle di antaranya.
- **Nexus** di kedua ujung (HP 1200). Nexus kebal sampai **kedua menara salah satu
  lane** hancur.
- **Menara**: 2 per lane per tim (luar + dalam) = 6 per tim. Menara dalam kebal
  sebelum menara luar di lane yang sama jatuh. Menara memprioritaskan minion, lalu
  hero.
- **Minion**: gelombang per 14 detik, 3 minion per lane per tim, mengikuti waypoint
  lane. Minion bertema faksi: **Samudra** dan **Merapi**.
- **Cover fisika**: perlindungan sekaligus pemantul proyektil; hancur setelah
  menerima energi tumbukan cukup.
- Nexus hancur = kemenangan. Waktu habis = skor lebih tinggi menang.

---

## 10. Disconnect, AI Takeover, dan Respawn

### 10.1 Saat koneksi hilang

1. Server menandai pemain `disconnected`; match **tidak berhenti**.
2. Slot langsung dikendalikan AI takeover.
3. Rekan/lawan melihat status "AI TAKEOVER".
4. AI takeover bergerak, menyerang, menjawab kuis menara, dan hidup kembali lewat
   timer respawn, dengan akurasi serta delay yang dibatasi (tidak instan).

### 10.2 Reconnect

- Client mencoba reconnect otomatis; grace period 60 detik sejak disconnect
  terakhir.
- Bila berhasil: AI berhenti, kendali kembali, statistik/HP/posisi tetap.
- Bila gagal sampai match selesai: AI menyelesaikan match atas nama slot.

### 10.3 Keputusan produk

Tidak ada pause, untuk menjaga permainan tetap adil dan mencegah eksploitasi
disconnect. AI takeover adalah pengganti sementara, bukan pengganti permanen.

---

## 11. Alur Layar dan UX

1. **Lobi pusat komando:** nama, hero, tingkat fisika, tombol Latihan vs AI, CARI
   LAWAN, BUAT ROOM, GABUNG, serta panel BELAJAR FISIKA (Materi, Latihan, Asisten).
2. **Matchmaking / Room:** kode room, daftar pemain, tombol siap, countdown.
3. **Champion Select** (25 detik): pre-pick, kunci hero, filter peran, hero lawan
   disembunyikan, auto-lock saat waktu habis.
4. **Loading:** lineup kedua tim, tips, progres.
5. **Pertandingan:** arena, HUD, kartu kuis menara, banner kuis hidup kembali, feed
   event, notifikasi combat.
6. **Hasil:** menang/kalah, MVP, papan skor 3v3, tombol Main Lagi.
7. **Disconnect:** banner dan status AI takeover, indikator reconnect.

**HUD:** minimap kiri-atas dengan panel rekan di bawahnya; timer, skor KO, dan
objektif di tengah; lawan terdekat dan sisa menara di kanan-atas; joystick
kiri-bawah; panel diri di tengah-bawah; tombol serang besar kanan-bawah.

**Kontrol:** WASD/joystick untuk gerak, klik/`J` untuk serang, `Space` dash, `R`
shockwave, `E` super, `F` SERANG SOAL, tombol `1`–`4` untuk menjawab soal.

**Aksesibilitas:** kontrol keyboard, ukuran teks soal besar, kontras tinggi, opsi
suara on/off, dan status tidak bergantung pada warna saja.

**Sinyal tim:** ketuk minimap untuk "Ayo ke sini", tekan lama untuk "Bahaya".

---

## 12. Metrik Keberhasilan

- **Match completion rate** ≥ 85% (tidak macet saat disconnect).
- **Kuis menara dipakai** di mayoritas match (minimal satu kali per match).
- **Time-to-first-fun** ≤ 60 detik dari membuka aplikasi sampai aksi pertama.
- **Rata-rata jawaban benar** 50–70%.
- **Disconnect recovery rate** ≥ 60% untuk reconnect dalam 60 detik.
- **Tidak ada mismatch** antara hasil kuis di client dan server.

---

## 13. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Soal mengganggu flow combat | Sedang | Soal hanya muncul saat diminta (kuis menara) atau saat tumbang; overlay ringkas. |
| Pemain non-fisika frustrasi | Sedang | Tiga tingkat, penjelasan setelah jawaban, latihan tanpa tekanan. |
| Menyontek | Rendah–sedang | Bank acak tanpa ulang, kunci di server, ID kuis divalidasi. |
| Disconnect merusak match | Tinggi | AI takeover, reconnect 60 detik, pemrosesan hasil tetap. |
| Gameplay fisika terlalu rumit | Sedang | Representasi visual impuls, tooltip, onboarding pendek. |
| Scope creep (5v5, item shop) | Tinggi | Fokus 3v3 tiga lane; fitur lain di roadmap. |

---

## 14. Acceptance Criteria

1. Dua tim 3v3 dapat bermain lewat room kode atau matchmaking; seat kosong diisi bot.
2. Kuis menara muncul saat membidik menara lawan dan SERANG SOAL; jawaban benar
   memberi damage besar, jawaban salah memberi Momentum Loss.
3. Pemain manusia tumbang hidup kembali setelah 2 jawaban benar (tanpa timer);
   bot/AI takeover memakai timer.
4. Server menolak jawaban yang tidak valid, duplikat, atau terlambat; kunci jawaban
   tidak bocor.
5. Enam hero dapat dipilih, termasuk Champion Select dengan hero lawan tersembunyi.
6. Proyektil memantul dari cover dan memberi knockback; cover dapat hancur.
7. Menara dan Nexus dapat dihancurkan; kondisi menang/kalah konsisten.
8. Jika satu client ditutup, match berlanjut dengan AI takeover dan bisa reconnect.
9. `npm test` lulus untuk fisika, kuis, respawn, dan disconnect/reconnect.

---

## 15. Roadmap

**Fase 1 — Validasi (sekarang):** 3v3 tiga lane, 6 hero, kuis menara, kuis hidup
kembali, AI takeover.

**Fase 2 — Kedalaman:** jungle monster + soal, objective Turtle/Lord, item shop,
reconnect terikat akun, tutorial fisika interaktif.

**Fase 3 — Kompetitif:** hidden MMR, ranked, mastery per topik, replay, spectator,
bank soal besar dengan rotasi.

**Fase 4 — Platform:** build lintas platform, monetisasi kosmetik non-pay-to-win.

---

## 16. Definisi Istilah

- **Kuis menara:** soal fisika yang muncul saat menyerang menara lewat SERANG SOAL.
- **Kuis hidup kembali:** dua soal fisika untuk hidup kembali setelah tumbang.
- **Momentum Loss:** penalti kecepatan setelah jawaban salah.
- **AI takeover:** pengambilalihan sementara slot oleh bot saat disconnect.
- **Momentum:** besaran fisika `p = m × v` yang juga menjadi tema desain.
- **Nexus:** bangunan inti yang harus dihancurkan untuk menang.
