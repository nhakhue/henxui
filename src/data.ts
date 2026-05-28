import { PresetTemplate, ZodiacAnimal } from "./types";

export const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  "🐭", // Tí
  "🐮", // Sửu
  "🐯", // Dần
  "🐱", // Mão
  "🐉", // Thìn
  "🐍", // Tỵ
  "🐴", // Ngọ
  "🐐", // Mùi
  "🐵", // Thân
  "🐔", // Dậu
  "🐶", // Tuất
  "🐷"  // Hợi
];

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "beer-killer",
    name: "🍺 Sát thủ bia",
    icon: "🍺",
    themeColor: "from-amber-400 to-orange-500",
    segments: [
      { text: "Uống 1 ly 🍻", color: "#EF4444" }, // Red
      { text: "May mắn: Qua lượt! 🎉", color: "#3B82F6" }, // Blue
      { text: "Bên trái uống nửa ly 👈", color: "#F59E0B" }, // Yellow
      { text: "Bên phải uống 1 ly 👉", color: "#10B981" }, // Green
      { text: "Đồng khởi! Cả bàn 100% 🍻", color: "#8B5CF6" }, // Purple
      { text: "Chỉ định 1 người uống 🎯", color: "#EC4899" }, // Pink
      { text: "Uống 2 ly kịch trần 💀", color: "#6366F1" }, // Indigo
      { text: "Hát 1 bài hoặc uống 1 ly 🎤", color: "#14B8A6" } // Teal
    ]
  },
  {
    id: "yes-no",
    name: "🤔 Yes / No",
    icon: "🤔",
    themeColor: "from-slate-500 to-slate-700",
    segments: [
      { text: "CÓ CHẮC CHẮN! ✅", color: "#10B981" },
      { text: "KHÔNG BAO GIỜ! ❌", color: "#EF4444" },
      { text: "CÓ CHẮC CHẮN! ✅", color: "#10B981" },
      { text: "KHÔNG BAO GIỜ! ❌", color: "#EF4444" },
      { text: "HỎI LẠI SAU COI 🧭", color: "#F59E0B" },
      { text: "CÓ LẼ LÀ CÓ... 😏", color: "#6366F1" }
    ]
  },
  {
    id: "truth-dare",
    name: "😈 Truth / Dare",
    icon: "😈",
    themeColor: "from-pink-500 to-purple-600",
    segments: [
      { text: "Thật: Ai quyến rũ nhất ở đây? 😏", color: "#EC4899" },
      { text: "Thách: Gọi điện cho crush tỏ tình! 📞", color: "#8B5CF6" },
      { text: "Thật: Tiết lộ tật xấu thầm kín 🤫", color: "#EF4444" },
      { text: "Thách: Nhảy sexy quyến rũ 15 giây 💃", color: "#F59E0B" },
      { text: "Thật: Kể kỷ niệm xấu hổ nhất 🙈", color: "#3B82F6" },
      { text: "Thách: Cho cả bàn xem 1 ảnh dìm hàng 📱", color: "#10B981" }
    ]
  }
];

export const THEME_COLORS_PALETTE = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6366F1"  // Indigo
];
