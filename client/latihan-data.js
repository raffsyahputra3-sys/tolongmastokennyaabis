// Data Latihan Fisika per Materi (dari HTML sumber, teks soal tidak diubah).
// Dipakai oleh client/latihan.js.
export const PASSING = 70; // nilai minimal tuntas

export const MATERI = [
  {
    id: "kinematika", nama: "Kinematika & Dinamika", icon: "🏃",
    soal: [
      { q: "Mobil menempuh 120 m dalam 8 s. Kecepatannya?", o: ["10 m/s", "12 m/s", "15 m/s", "20 m/s"], a: 2 },
      { q: "Motor dari diam mencapai 20 m/s dalam 4 s. Percepatannya?", o: ["4 m/s²", "5 m/s²", "8 m/s²", "80 m/s²"], a: 1 },
      { q: "Benda dijatuhkan dari 80 m (g=10). Waktu jatuh?", o: ["2 s", "3 s", "4 s", "8 s"], a: 2 },
      { q: "Bola ditendang v₀=20 m/s, θ=45°, g=10. Jangkauan R?", o: ["20 m", "30 m", "40 m", "50 m"], a: 2 },
      { q: "Gaya 80 N pada benda 16 kg. Percepatan?", o: ["2 m/s²", "4 m/s²", "5 m/s²", "8 m/s²"], a: 2 },
      { q: "Peti 20 kg, μ_k=0,2, g=10, didorong 60 N. Percepatan?", o: ["0,5 m/s²", "1 m/s²", "2 m/s²", "3 m/s²"], a: 1 },
      { q: "Dua gaya 12 N dan 8 N berlawanan arah. Resultan?", o: ["20 N", "4 N", "96 N", "0 N"], a: 1 },
      { q: "Benda 4 kg di Bulan (g=1,6). Beratnya?", o: ["4 N", "6,4 N", "40 N", "1,6 N"], a: 1 },
    ],
  },
  {
    id: "energi", nama: "Energi & Usaha", icon: "⚡",
    soal: [
      { q: "Gaya 40 N mendorong benda 5 m searah. Usaha?", o: ["8 J", "45 J", "200 J", "0 J"], a: 2 },
      { q: "Benda 3 kg bergerak 4 m/s. Energi kinetik?", o: ["12 J", "24 J", "48 J", "6 J"], a: 1 },
      { q: "Batu 2 kg di ketinggian 5 m (g=10). Energi potensial?", o: ["10 J", "50 J", "100 J", "20 J"], a: 2 },
      { q: "Usaha 1200 J dalam 30 s. Daya?", o: ["40 W", "36000 W", "1230 W", "30 W"], a: 0 },
      { q: "Bola 0,4 kg melaju 25 m/s. Momentum?", o: ["5 kg·m/s", "10 kg·m/s", "62,5 kg·m/s", "0,016 kg·m/s"], a: 1 },
      { q: "Benda 3 kg (4 m/s) menabrak 1 kg diam & menyatu. v'?", o: ["1 m/s", "2 m/s", "3 m/s", "4 m/s"], a: 2 },
      { q: "Bola 2 kg jatuh dari 20 m (g=10). v saat mendarat?", o: ["10 m/s", "15 m/s", "20 m/s", "40 m/s"], a: 2 },
      { q: "Impuls gaya 50 N selama 0,4 s?", o: ["20 N·s", "12,5 N·s", "50,4 N·s", "0,008 N·s"], a: 0 },
    ],
  },
  {
    id: "listrik", nama: "Listrik", icon: "🔌",
    soal: [
      { q: "Muatan 60 C lewat dalam 12 s. Arus?", o: ["5 A", "720 A", "0,2 A", "72 A"], a: 0 },
      { q: "Energi 24 J memindahkan 4 C. Tegangan?", o: ["6 V", "96 V", "0,17 V", "28 V"], a: 0 },
      { q: "Baterai 24 V dengan resistor 8 Ω. Arus?", o: ["192 A", "3 A", "0,33 A", "32 A"], a: 1 },
      { q: "Resistor 5 Ω & 15 Ω seri. Hambatan total?", o: ["3,75 Ω", "20 Ω", "10 Ω", "75 Ω"], a: 1 },
      { q: "Resistor 8 Ω & 8 Ω paralel. Hambatan total?", o: ["16 Ω", "4 Ω", "8 Ω", "2 Ω"], a: 1 },
      { q: "Lampu 220 V dialiri 0,5 A. Daya?", o: ["440 W", "110 W", "220,5 W", "55 W"], a: 1 },
      { q: "Dua muatan 2 μC & 3 μC berjarak 3 cm. Gaya Coulomb?", o: ["60 N", "6 N", "0,6 N", "600 N"], a: 0 },
      { q: "Arus masuk 8 A, keluar 3 A dan x. x = ?", o: ["5 A", "11 A", "24 A", "3 A"], a: 0 },
    ],
  },
  {
    id: "gelombang", nama: "Gelombang & Bunyi", icon: "🌊",
    soal: [
      { q: "30 getaran dalam 6 s. Frekuensi?", o: ["5 Hz", "0,2 Hz", "36 Hz", "180 Hz"], a: 0 },
      { q: "Periode 0,25 s. Frekuensi?", o: ["0,25 Hz", "2 Hz", "4 Hz", "25 Hz"], a: 2 },
      { q: "λ = 3 m, f = 4 Hz. Cepat rambat?", o: ["0,75 m/s", "7 m/s", "12 m/s", "1,33 m/s"], a: 2 },
      { q: "Sirene 800 Hz diam, pendengar mendekat 34 m/s (v=340). f didengar?", o: ["880 Hz", "727 Hz", "834 Hz", "800 Hz"], a: 0 },
      { q: "Sumber 600 Hz menjauh 20 m/s (v=340). f didengar?", o: ["566,7 Hz", "635,3 Hz", "600 Hz", "580 Hz"], a: 0 },
      { q: "Gelombang dengan λ=0,5 m dan v=340 m/s. Frekuensi?", o: ["170 Hz", "680 Hz", "340,5 Hz", "0,0015 Hz"], a: 1 },
      { q: "20 getaran dalam 4 s. Periode?", o: ["0,2 s", "5 s", "80 s", "0,8 s"], a: 0 },
      { q: "λ=2 m, T=0,5 s. Cepat rambat?", o: ["1 m/s", "4 m/s", "2,5 m/s", "0,25 m/s"], a: 1 },
    ],
  },
  {
    id: "optik", nama: "Optik", icon: "🔭",
    soal: [
      { q: "Cermin cekung f=15 cm, benda di 30 cm. Jarak bayangan?", o: ["15 cm", "30 cm", "10 cm", "45 cm"], a: 1 },
      { q: "Lensa cembung f=20 cm, benda di 30 cm. Jarak bayangan?", o: ["60 cm", "50 cm", "12 cm", "10 cm"], a: 0 },
      { q: "Cermin cekung f=10 cm, benda 30 cm. Perbesaran?", o: ["0,5", "2", "3", "1"], a: 0 },
      { q: "Cahaya udara→air (n=1,5), θ₁=30°. θ₂ ≈ ?", o: ["30°", "19,5°", "45°", "15°"], a: 1 },
      { q: "Lensa cembung f=10 cm, benda di 15 cm. Perbesaran?", o: ["1", "2", "3", "0,5"], a: 1 },
      { q: "Cermin cembung f=−20 cm, benda 40 cm. s'?", o: ["−13,3 cm", "13,3 cm", "−40 cm", "20 cm"], a: 0 },
      { q: "Indeks bias medium jika v=2×10⁸ m/s (c=3×10⁸)?", o: ["1,5", "2", "0,67", "3"], a: 0 },
      { q: "Benda di titik fokus lensa cembung. Bayangan?", o: ["Nyata terbalik", "Maya tegak", "Di tak hingga", "Di pusat lensa"], a: 2 },
    ],
  },
  {
    id: "magnet", nama: "Magnet & Mekanika Lain", icon: "🧲",
    soal: [
      { q: "Kawat 2 m, I=3 A, B=0,5 T tegak lurus. Gaya?", o: ["3 N", "1,5 N", "6 N", "0,75 N"], a: 0 },
      { q: "Pegas k=300 N/m ditarik 0,2 m. Gaya pemulih?", o: ["60 N", "1500 N", "0,6 N", "30 N"], a: 0 },
      { q: "Pegas k=200 N/m, x=0,1 m. Energi potensial pegas?", o: ["20 J", "1 J", "2 J", "0,5 J"], a: 1 },
      { q: "Bandul L=2,5 m, g=10. Periode ≈ ?", o: ["3,14 s", "1,57 s", "6,28 s", "0,5 s"], a: 0 },
      { q: "Tekanan hidrostatis kedalaman 5 m (ρ=1000, g=10)?", o: ["50000 Pa", "5000 Pa", "500 Pa", "500000 Pa"], a: 0 },
      { q: "Balok V=0,004 m³ tercelup penuh di air (ρ=1000, g=10). Gaya apung?", o: ["40 N", "4 N", "400 N", "0,4 N"], a: 0 },
      { q: "Berjalan 9 m timur + 12 m utara. Perpindahan?", o: ["21 m", "15 m", "108 m", "3 m"], a: 1 },
      { q: "36 km/jam = ... m/s", o: ["3,6", "10", "36", "100"], a: 1 },
    ],
  },
];
