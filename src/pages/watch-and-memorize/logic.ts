import type { GameImage } from "./types";

export const shuffle = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

export function prepareRoundImages(all: GameImage[], count: number) {
  const shuffled = shuffle(all);
  const targets = shuffled.slice(0, count);
  const distractors = shuffled.slice(count);
  const options = shuffle([...targets, ...distractors]);
  return { targets, options };
}
