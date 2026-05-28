/**
 * Types definition for henxui.online Wheel of Fortune App
 */

export interface Segment {
  id: string;
  text: string;
  color: string;
}

export type ZodiacAnimal =
  | "🐭" // Tí (Chuột)
  | "🐮" // Sửu (Trâu)
  | "🐯" // Dần (Cọp)
  | "🐱" // Mão (Mèo)
  | "🐉" // Thìn (Rồng)
  | "🐍" // Tỵ (Rắn)
  | "🐴" // Ngọ (Ngựa)
  | "🐐" // Mùi (Dê)
  | "🐵" // Thân (Khỉ)
  | "🐔" // Dậu (Gà)
  | "🐶" // Tuất (Chó)
  | "🐷"; // Hợi (Heo)

export interface Player {
  id: string;
  name: string;
  zodiac: ZodiacAnimal;
  color?: string;
}

export interface PresetTemplate {
  id: string;
  name: string;
  icon: string;
  segments: Omit<Segment, "id">[];
  themeColor: string; // for pill highlights
}

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
}
