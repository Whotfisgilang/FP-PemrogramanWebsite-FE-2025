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

// Game template ID dari backend (dari tabel GameTemplates)
export const GAME_TEMPLATE_ID = "6a7e3503-6faa-4d61-ab14-01b868fd1c70";

// 🌐 Base URL backend WordIT
// Menggunakan environment variable untuk fleksibilitas
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
