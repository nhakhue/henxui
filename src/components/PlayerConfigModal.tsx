import { useState, useEffect } from "react";
import { Player, ZodiacAnimal } from "../types";
import { ZODIAC_ANIMALS } from "../data";
import { X, Trash2, Check } from "lucide-react";
import EmojiAvatar from "./EmojiAvatar";

interface PlayerConfigModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlayer: Player) => void;
  onDelete: (playerId: string) => void;
  isNew?: boolean;
}

// 10 Vibrant background colors suitable for dark themes
export const AVATAR_COLORS = [
  "#FF4E00", // Henxui Orange
  "#EF4444", // Red Active
  "#22C55E", // Green Success
  "#3B82F6", // Blue Electric
  "#EC4899", // Trendy Pink
  "#A855F7", // Purple Neon
  "#F59E0B", // Amber Gold
  "#06B6D4", // Cyan Ice
  "#14B8A6", // Teal Wave
  "#6366F1", // Indigo Star
];

export default function PlayerConfigModal({
  player,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew = false,
}: PlayerConfigModalProps) {
  const [name, setName] = useState("");
  const [zodiac, setZodiac] = useState<ZodiacAnimal>("🐭");
  const [color, setColor] = useState("#FF4E00");

  useEffect(() => {
    if (player) {
      setName(player.name);
      setZodiac(player.zodiac);
      setColor(player.color || AVATAR_COLORS[0]);
    }
  }, [player, isOpen]);

  if (!isOpen || !player) return null;

  const handleSave = () => {
    onSave({
      ...player,
      name: name.trim() || player.name,
      zodiac,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in animate-duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal dialog box */}
      <div
        id="player_config_dialog"
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative z-10 overflow-hidden transform scale-100 transition-all text-white"
      >
        {/* Glow decoration */}
        <div 
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black tracking-wider uppercase text-neutral-400 font-mono">
            {isNew ? "➕ Thêm người chơi mới" : "⚙️ Cấu hình người chơi"}
          </h3>
          <button
            id="close_player_config_btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Display Big preview */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 transition-all duration-300 relative"
            style={{
              backgroundColor: `${color}25`, // translucent body
              borderColor: color,
              boxShadow: `0 8px 24px -6px ${color}35`,
            }}
          >
            <EmojiAvatar emoji={zodiac} className="text-4xl w-10 h-10 object-contain" />
          </div>
          <span className="text-[10px] text-neutral-500 mt-2 font-mono uppercase tracking-widest">
            Ảnh Đại Diện Playtime
          </span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5 font-mono">
              🏷️ Tên đại diện
            </label>
            <input
              type="text"
              id="player_config_name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên..."
              maxLength={16}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-neutral-700 font-sans shadow-inner"
            />
          </div>

          {/* Color Pallettes */}
          <div>
            <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5 font-mono">
              🎨 Tông màu đại diện
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  id={`btn_color_pick_${c.replace("#", "")}`}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 rounded-lg flex items-center justify-center transition-all duration-150 transform hover:scale-110 active:scale-95 cursor-pointer relative"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="bg-neutral-950/80 rounded-full p-0.5 text-white shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Zodiac Picker Grid */}
          <div>
            <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5 font-mono flex items-center gap-1">
              <EmojiAvatar emoji={zodiac} className="w-4 h-4 text-sm inline-block" />
              <span>Chọn linh vật (12 Con Giáp)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800 max-h-40 overflow-y-auto">
              {ZODIAC_ANIMALS.map((animal) => {
                const zodiacNames: Record<string, string> = {
                  "🐭": "Tí • Chuột",
                  "🐮": "Sửu • Trâu",
                  "🐯": "Dần • Cọp",
                  "🐱": "Mão • Mèo",
                  "🐉": "Thìn • Rồng",
                  "🐍": "Tỵ • Rắn",
                  "🐴": "Ngọ • Ngựa",
                  "🐐": "Mùi • Dê",
                  "🐵": "Thân • Khỉ",
                  "🐔": "Dậu • Gà",
                  "🐶": "Tuất • Chó",
                  "🐷": "Hợi • Heo"
                };
                const name = zodiacNames[animal] || "";
                return (
                  <button
                    key={animal}
                    id={`btn_zodiac_pick_${animal}`}
                    type="button"
                    onClick={() => setZodiac(animal)}
                    className={`h-11 px-2 flex items-center gap-1.5 rounded-lg transition-all active:scale-95 text-left border cursor-pointer
                      ${zodiac === animal
                        ? "bg-neutral-800 border-white/40 text-white font-bold"
                        : "bg-transparent border-transparent hover:bg-neutral-900 text-neutral-300"
                      }`}
                  >
                    <EmojiAvatar emoji={animal} className="w-5 h-5 text-xl flex-shrink-0" />
                    <span className="text-[10px] font-bold tracking-tight text-neutral-400 font-sans leading-none line-clamp-1">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center gap-3">
          {/* Cancel/Delete Action */}
          {isNew ? (
            <button
              id="player_config_cancel_btn"
              type="button"
              onClick={onClose}
              className="px-5 h-11 bg-neutral-800 hover:bg-neutral-700/85 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              Hủy
            </button>
          ) : (
            <button
              id="player_config_delete_btn"
              type="button"
              onClick={() => {
                onDelete(player.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 h-11 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-500 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Xóa khỏi lượt chơi"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa</span>
            </button>
          )}

          {/* Save/Add Action */}
          <button
            id="player_config_save_btn"
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isNew ? "Thêm người chơi" : "Xác nhận"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
