export type GameImage = {
  id: string; // id unik gambar
  src: string; // path ke gambar (di public/)
  label: string; // label / nama gambar
};

export type GamePhase = "idle" | "show" | "select" | "result";
