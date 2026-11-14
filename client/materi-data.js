// Data Materi Fisika Interaktif (dari HTML sumber, teks tidak diubah).
// Dipakai oleh client/materi.js.
export const BAB = [
  {
    id: "bab1",
    judul: "Bab 1: Kinematika & Dinamika",
    intro:
      "Kinematika mempelajari gerak benda tanpa mempersoalkan penyebabnya (posisi, kecepatan, percepatan). Dinamika mempelajari penyebab gerak, yaitu gaya. Keduanya dihubungkan Hukum Newton.",
    topik: [
      {
        nama: "Kecepatan",
        pengertian: "Perubahan posisi tiap satuan waktu. Besaran vektor.",
        rumus: "v = Δx / Δt",
        contoh: "Mobil menempuh 30 m dalam 6 s → v = 5 m/s.",
        kalk: {
          label: "Hitung Kecepatan",
          fields: [{ id: "dx", label: "Δx (m)" }, { id: "dt", label: "Δt (s)" }],
          fn: function (v) { return v.dt === 0 ? "Δt tidak boleh 0" : "v = " + (v.dx / v.dt).toFixed(2) + " m/s"; },
        },
      },
      {
        nama: "Percepatan",
        pengertian: "Perubahan kecepatan tiap satuan waktu.",
        rumus: "a = Δv / Δt",
        contoh: "Motor dari diam ke 12 m/s dalam 3 s → a = 4 m/s².",
        kalk: {
          label: "Hitung Percepatan",
          fields: [{ id: "dv", label: "Δv (m/s)" }, { id: "dt", label: "Δt (s)" }],
          fn: function (v) { return v.dt === 0 ? "Δt tidak boleh 0" : "a = " + (v.dv / v.dt).toFixed(2) + " m/s²"; },
        },
      },
      {
        nama: "GLB & GLBB",
        pengertian: "GLB: kecepatan konstan (a=0). GLBB: percepatan konstan.",
        rumus: "GLB: x = v·t | GLBB: v = v₀ + at; x = v₀t + ½at²; v² = v₀² + 2ax",
        contoh: "Kereta start dari diam, a=2 m/s², t=5 s → v=10 m/s, x=25 m.",
        kalk: {
          label: "Hitung GLBB (jarak)",
          fields: [{ id: "v0", label: "v₀ (m/s)" }, { id: "a", label: "a (m/s²)" }, { id: "t", label: "t (s)" }],
          fn: function (v) {
            var vf = v.v0 + v.a * v.t;
            var x = v.v0 * v.t + 0.5 * v.a * v.t * v.t;
            return "v = " + vf.toFixed(2) + " m/s<br>x = " + x.toFixed(2) + " m";
          },
        },
      },
      {
        nama: "Gravitasi",
        pengertian: "Gaya tarik antar benda bermassa. Massa tetap, berat berubah mengikuti g.",
        rumus: "F = G·m₁m₂/r² ; w = mg",
        contoh: "Benda 10 kg di Bumi (g=10) → w=100 N. Di Bulan (g=1,6) → 16 N.",
        kalk: {
          label: "Hitung Berat",
          fields: [{ id: "m", label: "m (kg)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) { return "w = " + (v.m * v.g).toFixed(2) + " N"; },
        },
      },
      {
        nama: "Jatuh Bebas",
        pengertian: "Gerak jatuh hanya karena gravitasi, tanpa kecepatan awal.",
        rumus: "v = gt ; h = ½gt²",
        contoh: "Dijatuhkan dari 45 m → t=3 s, v=30 m/s.",
        kalk: {
          label: "Hitung Jatuh Bebas",
          fields: [{ id: "h", label: "h (m)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) {
            if (v.h < 0 || v.g <= 0) return "Input tidak valid";
            var t = Math.sqrt(2 * v.h / v.g);
            return "t = " + t.toFixed(2) + " s<br>v = " + (v.g * t).toFixed(2) + " m/s";
          },
        },
      },
      {
        nama: "Gerak Proyektil",
        pengertian: "Gerak parabola. Horizontal GLB, vertikal GLBB.",
        rumus: "R = v₀²sin2θ/g ; H = v₀²sin²θ/2g",
        contoh: "v₀=20 m/s, θ=30° → R≈34,6 m, H=5 m.",
        kalk: {
          label: "Hitung Proyektil",
          fields: [{ id: "v0", label: "v₀ (m/s)" }, { id: "th", label: "θ (°)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) {
            var r = v.th * Math.PI / 180;
            var R = v.v0 * v.v0 * Math.sin(2 * r) / v.g;
            var H = v.v0 * v.v0 * Math.sin(r) * Math.sin(r) / (2 * v.g);
            return "R = " + R.toFixed(2) + " m<br>H = " + H.toFixed(2) + " m";
          },
        },
      },
      {
        nama: "Gaya",
        pengertian: "Tarikan/dorongan yang mengubah gerak atau bentuk. Vektor, satuan newton.",
        rumus: "Searah: F = F₁+F₂ | Berlawanan: F = |F₁−F₂|",
        contoh: "20 N & 30 N → searah 50 N, berlawanan 10 N.",
        kalk: {
          label: "Hitung Resultan Gaya",
          fields: [{ id: "f1", label: "F₁ (N)" }, { id: "f2", label: "F₂ (N)" }, { id: "arah", label: "1=searah, 0=berlawanan" }],
          fn: function (v) {
            var F = (v.arah === 1) ? (v.f1 + v.f2) : Math.abs(v.f1 - v.f2);
            return "F = " + F + " N";
          },
        },
      },
      {
        nama: "Hukum Newton",
        pengertian: "I: ΣF=0 → diam/GLB. II: ΣF=ma. III: aksi = −reaksi.",
        rumus: "ΣF = ma ; F_aksi = −F_reaksi",
        contoh: "Gaya 60 N pada 20 kg → a=3 m/s².",
        kalk: {
          label: "Hitung Percepatan (Hukum II)",
          fields: [{ id: "F", label: "ΣF (N)" }, { id: "m", label: "m (kg)" }],
          fn: function (v) { return v.m === 0 ? "Massa tidak boleh 0" : "a = " + (v.F / v.m).toFixed(2) + " m/s²"; },
        },
      },
      {
        nama: "Gaya Gesek",
        pengertian: "Penghambat gerak pada bidang sentuh. Statis saat diam, kinetis saat bergerak.",
        rumus: "f_s ≤ μ_s·N ; f_k = μ_k·N",
        contoh: "Peti 10 kg, μ_k=0,3, dorong 50 N → f_k=30 N, a=2 m/s².",
        kalk: {
          label: "Hitung Gesek Kinetis & Percepatan",
          fields: [{ id: "m", label: "m (kg)" }, { id: "mu", label: "μ_k" }, { id: "F", label: "F dorong (N)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) {
            var N = v.m * v.g;
            var fk = v.mu * N;
            var a = (v.F - fk) / v.m;
            return "N = " + N.toFixed(1) + " N<br>f_k = " + fk.toFixed(1) + " N<br>a = " + a.toFixed(2) + " m/s²";
          },
        },
      },
    ],
    kuis: [
      { q: "Mobil menempuh 60 m dalam 12 s. Kecepatannya?", o: ["5 m/s", "6 m/s", "7,2 m/s", "0,2 m/s"], a: 0 },
      { q: "Benda 5 kg di Bulan (g=1,6). Beratnya?", o: ["50 N", "8 N", "5 N", "1,6 N"], a: 1 },
      { q: "Gaya 40 N pada benda 8 kg. Percepatan?", o: ["5 m/s²", "0,2 m/s²", "32 m/s²", "48 m/s²"], a: 0 },
    ],
  },
  {
    id: "bab2",
    judul: "Bab 2: Energi & Usaha",
    intro:
      "Energi adalah kemampuan melakukan usaha dan bersifat kekal (hanya berubah bentuk). Momentum & tumbukan melengkapi analisis interaksi antar benda.",
    topik: [
      {
        nama: "Usaha",
        pengertian: "Gaya yang menghasilkan perpindahan searah gaya. Satuan joule.",
        rumus: "W = F·s·cosθ",
        contoh: "50 N mendorong 4 m searah → W = 200 J.",
        kalk: {
          label: "Hitung Usaha",
          fields: [{ id: "F", label: "F (N)" }, { id: "s", label: "s (m)" }, { id: "th", label: "θ (°)" }],
          fn: function (v) { return "W = " + (v.F * v.s * Math.cos(v.th * Math.PI / 180)).toFixed(2) + " J"; },
        },
      },
      {
        nama: "Energi Kinetik",
        pengertian: "Energi karena gerak.",
        rumus: "Ek = ½mv²",
        contoh: "Bola 2 kg, 10 m/s → Ek = 100 J.",
        kalk: {
          label: "Hitung Ek",
          fields: [{ id: "m", label: "m (kg)" }, { id: "v", label: "v (m/s)" }],
          fn: function (v) { return "Ek = " + (0.5 * v.m * v.v * v.v).toFixed(2) + " J"; },
        },
      },
      {
        nama: "Energi Potensial",
        pengertian: "Energi karena posisi/ketinggian.",
        rumus: "Ep = mgh",
        contoh: "Batu 5 kg di 4 m → Ep = 200 J.",
        kalk: {
          label: "Hitung Ep",
          fields: [{ id: "m", label: "m (kg)" }, { id: "h", label: "h (m)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) { return "Ep = " + (v.m * v.g * v.h).toFixed(2) + " J"; },
        },
      },
      {
        nama: "Kekekalan Energi Mekanik",
        pengertian: "Tanpa gesek, Ek+Ep tetap. Usaha total = perubahan Ek.",
        rumus: "Ek₁+Ep₁ = Ek₂+Ep₂ ; W = ΔEk",
        contoh: "Bola 1 kg jatuh 5 m → v = 10 m/s.",
        kalk: {
          label: "Hitung v dari Ketinggian",
          fields: [{ id: "h", label: "h (m)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) { return "v = " + Math.sqrt(2 * v.g * v.h).toFixed(2) + " m/s"; },
        },
      },
      {
        nama: "Daya",
        pengertian: "Laju melakukan usaha. Satuan watt.",
        rumus: "P = W/t",
        contoh: "600 J dalam 20 s → P = 30 W.",
        kalk: {
          label: "Hitung Daya",
          fields: [{ id: "W", label: "W (J)" }, { id: "t", label: "t (s)" }],
          fn: function (v) { return v.t === 0 ? "t tidak boleh 0" : "P = " + (v.W / v.t).toFixed(2) + " W"; },
        },
      },
      {
        nama: "Momentum & Impuls",
        pengertian: "Momentum = ukuran kesulitan menghentikan benda. Impuls = perubahan momentum.",
        rumus: "p = mv ; I = FΔt = Δp",
        contoh: "Bola 0,5 kg, 20 m/s → p = 10 kg·m/s.",
        kalk: {
          label: "Hitung Momentum",
          fields: [{ id: "m", label: "m (kg)" }, { id: "v", label: "v (m/s)" }],
          fn: function (v) { return "p = " + (v.m * v.v).toFixed(2) + " kg·m/s"; },
        },
      },
      {
        nama: "Tumbukan",
        pengertian: "Momentum selalu kekal. Lenting sempurna: Ek kekal. Tidak lenting: menyatu.",
        rumus: "m₁v₁+m₂v₂ = m₁v₁'+m₂v₂' ; v' = (m₁v₁+m₂v₂)/(m₁+m₂)",
        contoh: "2 kg (3 m/s) + 1 kg diam menyatu → v' = 2 m/s.",
        kalk: {
          label: "Hitung Tumbukan Tidak Lenting",
          fields: [{ id: "m1", label: "m₁ (kg)" }, { id: "v1", label: "v₁ (m/s)" }, { id: "m2", label: "m₂ (kg)" }, { id: "v2", label: "v₂ (m/s)" }],
          fn: function (v) {
            if (v.m1 + v.m2 === 0) return "Massa total 0";
            return "v' = " + ((v.m1 * v.v1 + v.m2 * v.v2) / (v.m1 + v.m2)).toFixed(2) + " m/s";
          },
        },
      },
    ],
    kuis: [
      { q: "Gaya 30 N mendorong benda 5 m searah. Usaha?", o: ["150 J", "6 J", "35 J", "0 J"], a: 0 },
      { q: "Benda 4 kg bergerak 5 m/s. Ek?", o: ["20 J", "50 J", "100 J", "10 J"], a: 1 },
      { q: "Usaha 800 J dalam 40 s. Daya?", o: ["20 W", "32000 W", "840 W", "40 W"], a: 0 },
    ],
  },
  {
    id: "bab3",
    judul: "Bab 3: Listrik",
    intro:
      "Listrik mempelajari muatan dan perpindahannya. Arus mengalir karena beda potensial, dibatasi hambatan (Hukum Ohm). Rangkaian kompleks dianalisis dengan Hukum Kirchhoff.",
    topik: [
      {
        nama: "Arus Listrik",
        pengertian: "Aliran muatan tiap satuan waktu. Satuan ampere.",
        rumus: "I = Q/t",
        contoh: "30 C dalam 10 s → I = 3 A.",
        kalk: {
          label: "Hitung Arus",
          fields: [{ id: "Q", label: "Q (C)" }, { id: "t", label: "t (s)" }],
          fn: function (v) { return v.t === 0 ? "t tidak boleh 0" : "I = " + (v.Q / v.t).toFixed(2) + " A"; },
        },
      },
      {
        nama: "Tegangan",
        pengertian: "Energi per satuan muatan / beda potensial. Satuan volt.",
        rumus: "V = W/Q",
        contoh: "12 J untuk 2 C → V = 6 V.",
        kalk: {
          label: "Hitung Tegangan",
          fields: [{ id: "W", label: "W (J)" }, { id: "Q", label: "Q (C)" }],
          fn: function (v) { return v.Q === 0 ? "Q tidak boleh 0" : "V = " + (v.W / v.Q).toFixed(2) + " V"; },
        },
      },
      {
        nama: "Hambatan & Hukum Ohm",
        pengertian: "Tegangan sebanding arus pada penghantar ohmik.",
        rumus: "V = I·R",
        contoh: "12 V, 4 Ω → I = 3 A.",
        kalk: {
          label: "Hitung Arus (Ohm)",
          fields: [{ id: "V", label: "V (V)" }, { id: "R", label: "R (Ω)" }],
          fn: function (v) { return v.R === 0 ? "R tidak boleh 0" : "I = " + (v.V / v.R).toFixed(2) + " A"; },
        },
      },
      {
        nama: "Rangkaian Seri",
        pengertian: "Satu jalur. Arus sama, tegangan terbagi.",
        rumus: "R_tot = R₁ + R₂ + …",
        contoh: "4 Ω & 6 Ω seri pada 20 V → R=10 Ω, I=2 A.",
        kalk: {
          label: "Hitung Seri (2 resistor)",
          fields: [{ id: "r1", label: "R₁ (Ω)" }, { id: "r2", label: "R₂ (Ω)" }],
          fn: function (v) { return "R_tot = " + (v.r1 + v.r2).toFixed(2) + " Ω"; },
        },
      },
      {
        nama: "Rangkaian Paralel",
        pengertian: "Bercabang. Tegangan sama, arus terbagi.",
        rumus: "1/R_tot = 1/R₁ + 1/R₂ + …",
        contoh: "6 Ω & 3 Ω paralel → R = 2 Ω.",
        kalk: {
          label: "Hitung Paralel (2 resistor)",
          fields: [{ id: "r1", label: "R₁ (Ω)" }, { id: "r2", label: "R₂ (Ω)" }],
          fn: function (v) {
            if (v.r1 === 0 || v.r2 === 0) return "R tidak boleh 0";
            return "R_tot = " + (1 / (1 / v.r1 + 1 / v.r2)).toFixed(2) + " Ω";
          },
        },
      },
      {
        nama: "Daya Listrik",
        pengertian: "Energi listrik tiap detik.",
        rumus: "P = VI = I²R = V²/R ; W = P·t",
        contoh: "220 V, 0,5 A → P = 110 W.",
        kalk: {
          label: "Hitung Daya (V & I)",
          fields: [{ id: "V", label: "V (V)" }, { id: "I", label: "I (A)" }],
          fn: function (v) { return "P = " + (v.V * v.I).toFixed(2) + " W"; },
        },
      },
      {
        nama: "Hukum Kirchhoff",
        pengertian: "I: arus masuk = keluar. II: jumlah beda potensial loop = 0.",
        rumus: "ΣI_masuk = ΣI_keluar ; ΣV = 0",
        contoh: "Masuk 5 A, keluar 2 A & x → x = 3 A.",
        kalk: {
          label: "Hitung Arus Cabang (KCL)",
          fields: [{ id: "masuk", label: "ΣI masuk (A)" }, { id: "keluar", label: "I keluar diketahui (A)" }],
          fn: function (v) { return "I cabang = " + (v.masuk - v.keluar).toFixed(2) + " A"; },
        },
      },
      {
        nama: "Hukum Coulomb",
        pengertian: "Gaya antar muatan titik. Sejenis tolak, beda tarik.",
        rumus: "F = k·q₁q₂/r², k = 9×10⁹",
        contoh: "2×1 μC, 3 cm → F = 10 N.",
        kalk: {
          label: "Hitung Gaya Coulomb",
          fields: [{ id: "q1", label: "q₁ (μC)" }, { id: "q2", label: "q₂ (μC)" }, { id: "r", label: "r (cm)" }],
          fn: function (v) {
            if (v.r === 0) return "r tidak boleh 0";
            var F = 9e9 * (v.q1 * 1e-6) * (v.q2 * 1e-6) / Math.pow(v.r / 100, 2);
            return "F = " + F.toFixed(2) + " N";
          },
        },
      },
    ],
    kuis: [
      { q: "Muatan 40 C lewat dalam 8 s. Arus?", o: ["5 A", "320 A", "0,2 A", "48 A"], a: 0 },
      { q: "12 V pada 3 Ω. Arus?", o: ["36 A", "4 A", "0,25 A", "15 A"], a: 1 },
      { q: "6 Ω & 3 Ω paralel. Hambatan total?", o: ["9 Ω", "4,5 Ω", "2 Ω", "18 Ω"], a: 2 },
    ],
  },
  {
    id: "bab4",
    judul: "Bab 4: Gelombang & Bunyi",
    intro:
      "Gelombang memindahkan energi tanpa memindahkan materi. Gelombang mekanik butuh medium; elektromagnetik tidak. Bunyi longitudinal, di udara ≈340 m/s.",
    topik: [
      {
        nama: "Frekuensi & Periode",
        pengertian: "Frekuensi = getaran/detik (Hz). Periode = waktu satu getaran.",
        rumus: "f = 1/T",
        contoh: "20 getaran dalam 10 s → f=2 Hz, T=0,5 s.",
        kalk: {
          label: "Hitung f & T",
          fields: [{ id: "n", label: "jumlah getaran" }, { id: "t", label: "t (s)" }],
          fn: function (v) {
            if (v.t === 0) return "t tidak boleh 0";
            var f = v.n / v.t;
            return "f = " + f.toFixed(2) + " Hz<br>T = " + (1 / f).toFixed(2) + " s";
          },
        },
      },
      {
        nama: "Cepat Rambat Gelombang",
        pengertian: "Jarak tempuh gelombang tiap detik.",
        rumus: "v = λ·f",
        contoh: "λ=2 m, f=5 Hz → v=10 m/s.",
        kalk: {
          label: "Hitung v",
          fields: [{ id: "lam", label: "λ (m)" }, { id: "f", label: "f (Hz)" }],
          fn: function (v) { return "v = " + (v.lam * v.f).toFixed(2) + " m/s"; },
        },
      },
      {
        nama: "Efek Doppler",
        pengertian: "Perubahan frekuensi akibat gerak relatif. Mendekat → naik.",
        rumus: "f_p = f_s·(v ± v_p)/(v ∓ v_s)",
        contoh: "700 Hz, sumber 20 m/s → ≈744 Hz mendekat.",
        kalk: {
          label: "Hitung Doppler (pendengar diam)",
          fields: [{ id: "fs", label: "f sumber (Hz)" }, { id: "vs", label: "v sumber (m/s)" }, { id: "v", label: "v bunyi (m/s)" }],
          fn: function (v) {
            if (v.v - v.vs <= 0) return "v sumber terlalu besar";
            var mendekat = v.fs * v.v / (v.v - v.vs);
            var menjauh = v.fs * v.v / (v.v + v.vs);
            return "Mendekat: " + mendekat.toFixed(1) + " Hz<br>Menjauh: " + menjauh.toFixed(1) + " Hz";
          },
        },
      },
    ],
    kuis: [
      { q: "40 getaran dalam 8 s. Frekuensi?", o: ["5 Hz", "0,2 Hz", "48 Hz", "320 Hz"], a: 0 },
      { q: "λ=4 m, f=2 Hz. Cepat rambat?", o: ["2 m/s", "6 m/s", "8 m/s", "0,5 m/s"], a: 2 },
    ],
  },
  {
    id: "bab5",
    judul: "Bab 5: Optik",
    intro:
      "Optik geometri memandang cahaya sebagai berkas lurus yang dipantulkan (cermin) atau dibiaskan (lensa). Letak & sifat bayangan ditentukan jarak benda dan fokus.",
    topik: [
      {
        nama: "Cermin",
        pengertian: "Cekung konvergen (f+), cembung divergen (f−).",
        rumus: "1/f = 1/s + 1/s' ; M = |s'/s| ; f = R/2",
        contoh: "f=10 cm, s=30 cm → s'=15 cm, M=0,5.",
        kalk: {
          label: "Hitung Bayangan Cermin/Lensa",
          fields: [{ id: "f", label: "f (cm)" }, { id: "s", label: "s (cm)" }],
          fn: function (v) {
            var sp = 1 / (1 / v.f - 1 / v.s);
            return "s' = " + sp.toFixed(2) + " cm<br>M = " + Math.abs(sp / v.s).toFixed(2);
          },
        },
      },
      {
        nama: "Lensa Cembung",
        pengertian: "Konvergen. Benda di luar fokus → nyata terbalik.",
        rumus: "1/f = 1/s + 1/s'",
        contoh: "f=10 cm, s=15 cm → s'=30 cm, M=2.",
        kalk: {
          label: "Hitung Bayangan Lensa",
          fields: [{ id: "f", label: "f (cm)" }, { id: "s", label: "s (cm)" }],
          fn: function (v) {
            var sp = 1 / (1 / v.f - 1 / v.s);
            return "s' = " + sp.toFixed(2) + " cm<br>M = " + Math.abs(sp / v.s).toFixed(2);
          },
        },
      },
      {
        nama: "Indeks Bias & Snell",
        pengertian: "n = c/v. Masuk medium lebih rapat → membelok ke normal.",
        rumus: "n = c/v ; n₁sinθ₁ = n₂sinθ₂",
        contoh: "Udara→air (n=1,33), θ₁=30° → θ₂≈22°.",
        kalk: {
          label: "Hitung Sudut Bias",
          fields: [{ id: "n1", label: "n₁" }, { id: "th1", label: "θ₁ (°)" }, { id: "n2", label: "n₂" }],
          fn: function (v) {
            var s = v.n1 * Math.sin(v.th1 * Math.PI / 180) / v.n2;
            if (s > 1) return "Terjadi pemantulan total";
            return "θ₂ = " + (Math.asin(s) * 180 / Math.PI).toFixed(2) + "°";
          },
        },
      },
    ],
    kuis: [
      { q: "Cermin cekung f=10 cm, benda 30 cm. Jarak bayangan?", o: ["15 cm", "20 cm", "7,5 cm", "40 cm"], a: 0 },
      { q: "Cahaya udara→air (n=1,33), θ=30°. Sudut bias ≈?", o: ["30°", "22°", "45°", "0°"], a: 1 },
    ],
  },
  {
    id: "bab6",
    judul: "Bab 6: Magnet & Mekanika Lain",
    intro:
      "Magnet berkaitan medan & gaya pada muatan bergerak. Pegas & bandul contoh getaran harmonik. Fluida mempelajari tekanan & gaya apung. Vektor & satuan SI adalah alat dasar.",
    topik: [
      {
        nama: "Magnet",
        pengertian: "Kutub sejenis tolak. Garis medan keluar dari utara. Kawat berarus dalam medan kena gaya.",
        rumus: "F = B·I·L·sinθ",
        contoh: "L=0,5 m, I=4 A, B=0,2 T tegak lurus → F=0,4 N.",
        kalk: {
          label: "Hitung Gaya Magnet",
          fields: [{ id: "B", label: "B (T)" }, { id: "I", label: "I (A)" }, { id: "L", label: "L (m)" }, { id: "th", label: "θ (°)" }],
          fn: function (v) { return "F = " + (v.B * v.I * v.L * Math.sin(v.th * Math.PI / 180)).toFixed(2) + " N"; },
        },
      },
      {
        nama: "Pegas (Hooke)",
        pengertian: "Gaya pemulih sebanding pertambahan panjang (elastis).",
        rumus: "F = kx ; Ep = ½kx² ; T = 2π√(m/k)",
        contoh: "k=200 N/m, x=0,1 m → F=20 N, Ep=1 J.",
        kalk: {
          label: "Hitung Pegas",
          fields: [{ id: "k", label: "k (N/m)" }, { id: "x", label: "x (m)" }, { id: "m", label: "m (kg)" }],
          fn: function (v) {
            if (v.k <= 0) return "k harus > 0";
            return "F = " + (v.k * v.x).toFixed(2) + " N<br>Ep = " + (0.5 * v.k * v.x * v.x).toFixed(2) + " J<br>T = " + (2 * Math.PI * Math.sqrt(v.m / v.k)).toFixed(2) + " s";
          },
        },
      },
      {
        nama: "Bandul",
        pengertian: "Ayunan sederhana. Sudut kecil: periode tak bergantung massa.",
        rumus: "T = 2π√(L/g)",
        contoh: "L=1 m, g=9,8 → T≈2 s.",
        kalk: {
          label: "Hitung Periode Bandul",
          fields: [{ id: "L", label: "L (m)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) { return v.g <= 0 ? "g harus > 0" : "T = " + (2 * Math.PI * Math.sqrt(v.L / v.g)).toFixed(2) + " s"; },
        },
      },
      {
        nama: "Fluida & Tekanan",
        pengertian: "Tekanan = gaya/luas. Hidrostatis bertambah dengan kedalaman. Pascal: diteruskan sama besar.",
        rumus: "P = F/A ; P = ρgh ; F₁/A₁ = F₂/A₂",
        contoh: "Kedalaman 10 m air → P=100.000 Pa.",
        kalk: {
          label: "Hitung Tekanan Hidrostatis",
          fields: [{ id: "rho", label: "ρ (kg/m³)" }, { id: "h", label: "h (m)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) { return "P = " + (v.rho * v.g * v.h).toFixed(0) + " Pa"; },
        },
      },
      {
        nama: "Gaya Apung (Archimedes)",
        pengertian: "Gaya ke atas = berat fluida yang dipindahkan.",
        rumus: "F_A = ρ_fluida·g·V_tercelup",
        contoh: "V=0,002 m³ di air → F_A=20 N.",
        kalk: {
          label: "Hitung Gaya Apung",
          fields: [{ id: "rho", label: "ρ fluida (kg/m³)" }, { id: "V", label: "V (m³)" }, { id: "g", label: "g (m/s²)" }],
          fn: function (v) { return "F_A = " + (v.rho * v.g * v.V).toFixed(2) + " N"; },
        },
      },
      {
        nama: "Vektor",
        pengertian: "Skalar: besar saja. Vektor: besar + arah. Bisa diuraikan & dijumlahkan.",
        rumus: "Aₓ=Acosθ ; A_y=Asinθ ; R=√(Rₓ²+R_y²)",
        contoh: "3 m timur + 4 m utara → 5 m, ≈53°.",
        kalk: {
          label: "Hitung Resultan Vektor (2D)",
          fields: [{ id: "x", label: "komponen x" }, { id: "y", label: "komponen y" }],
          fn: function (v) {
            var R = Math.hypot(v.x, v.y);
            var th = Math.atan2(v.y, v.x) * 180 / Math.PI;
            return "R = " + R.toFixed(2) + "<br>θ = " + th.toFixed(1) + "°";
          },
        },
      },
      {
        nama: "Satuan SI",
        pengertian: "Standar internasional. Dasar: m, kg, s, A, K, mol, cd.",
        rumus: "N=kg·m/s² ; J=N·m ; W=J/s ; Pa=N/m²",
        contoh: "36 km/jam = 10 m/s ; 300 g = 0,3 kg.",
        kalk: {
          label: "Konversi km/jam → m/s",
          fields: [{ id: "kmj", label: "km/jam" }],
          fn: function (v) { return (v.kmj / 3.6).toFixed(2) + " m/s"; },
        },
      },
    ],
    kuis: [
      { q: "Kawat 1 m, I=2 A, B=0,5 T tegak lurus. Gaya?", o: ["1 N", "0,5 N", "2 N", "0 N"], a: 0 },
      { q: "Pegas k=100 N/m ditarik 0,2 m. Gaya?", o: ["20 N", "500 N", "0,002 N", "10 N"], a: 0 },
      { q: "Berjalan 6 m timur + 8 m utara. Perpindahan?", o: ["14 m", "10 m", "48 m", "2 m"], a: 1 },
    ],
  },
];
