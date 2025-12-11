import type { GameImage } from "./types";

// 🖼️ Daftar gambar lokal untuk game-mu
export const ALL_IMAGES: GameImage[] = [
  { id: "kucing", src: "/images/watch-and-memorize/img1.jpg", label: "Kucing" },
  { id: "anjing", src: "/images/watch-and-memorize/img2.jpg", label: "Anjing" },
  { id: "bunga", src: "/images/watch-and-memorize/img3.jpg", label: "Bunga" },
  { id: "pohon", src: "/images/watch-and-memorize/img4.jpg", label: "Pohon" },
  { id: "gunung", src: "/images/watch-and-memorize/img5.jpg", label: "Gunung" },
  { id: "pantai", src: "/images/watch-and-memorize/img6.jpg", label: "Pantai" },
  { id: "jalan", src: "/images/watch-and-memorize/img7.jpg", label: "Jalan" },
  { id: "mobil", src: "/images/watch-and-memorize/img8.jpg", label: "Mobil" },
];

// 🔢 Konfigurasi gameplay
export const SHOW_COUNT = 4; // berapa gambar yang tampil di fase "show"
export const SHOW_DURATION_MS = 3000; // berapa lama (ms) gambar ditampilkan sebelum di-hide
export const TOTAL_TIME_SEC = 60; // total waktu satu game (detik)

// 🔗 Info game di backend (WAJIB SAMA dengan DB)
export const GAME_SLUG = "watch-and-memorize";

// TODO: ganti ini dengan id game di tabel `Game` (kolom id) di Neon backend-mu
// Contoh: "b9f1f7f8-8a20-4e93-98b9-3e8c9b5c1234"
export const GAME_ID = "REPLACE_WITH_YOUR_GAME_ID";

// 🌐 Base URL backend WordIT lokal
// Sesuaikan dengan BASE_URL di .env.development backend (biasanya http://localhost:4000)
export const API_BASE_URL = "http://localhost:4000/api";
