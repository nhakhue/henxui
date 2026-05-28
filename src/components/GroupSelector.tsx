import { Player, ZodiacAnimal } from "../types";
import { Trash2 } from "lucide-react";
import EmojiAvatar from "./EmojiAvatar";

interface GroupSelectorProps {
  players: Player[];
  activePlayerIndex: number;
  onEditPlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  onAddPlayer: () => void;
}

export default function GroupSelector({
  players,
  activePlayerIndex,
  onEditPlayer,
  onRemovePlayer,
  onAddPlayer,
}: GroupSelectorProps) {
  if (players.length === 0) {
    return (
      <div className="w-full text-center py-4 select-none flex flex-col items-center justify-center gap-2">
        <p className="text-xs text-slate-400 font-mono italic">
          💡 Bạn đang ở chế độ xoay một mình.
        </p>
        <button
          onClick={onAddPlayer}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4E00] text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#FF4E00]/10"
        >
          <span>👥 Thêm bạn cùng chơi (+1)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-3 bg-[#171717] border border-neutral-800 rounded-2xl shadow-inner select-none">
      <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-sans">
        <span>👥 Sơ đồ lượt chơi ({players.length} người)</span>
        <span className="text-[#FF4E00] animate-pulse font-mono tracking-normal capitalize">
          👉 Tới lượt ai, người đó tự bấm!
        </span>
      </div>

      {/* Grid or flex row of players */}
      <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-neutral-800">
        {players.map((player, idx) => {
          const isActive = idx === activePlayerIndex;
          const playerBgColor = player.color || "#FF4E00";
          return (
            <div key={player.id} className="flex-shrink-0 flex items-center gap-2.5">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 relative group
                  ${isActive
                    ? "bg-[#FF4E00]/15 border-[#FF4E00] shadow-md ring-2 ring-[#FF4E00]/10 scale-105 text-white"
                    : "bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-900 text-neutral-300"
                  }`}
              >
                {/* Tap to open configure dialog */}
                <button
                  id={`player_zodiac_${player.id}`}
                  onClick={() => onEditPlayer(player)}
                  title="Chạm để thay đổi màu, con giáp hoặc xóa"
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-sm border transform transition-all duration-150 active:scale-90 hover:scale-105 active:rotate-12
                    ${isActive ? "animate-bounce" : ""}
                  `}
                  style={{
                    backgroundColor: `${playerBgColor}22`,
                    borderColor: playerBgColor,
                    boxShadow: isActive ? `0 0 12px ${playerBgColor}35` : "none",
                  }}
                >
                  <EmojiAvatar emoji={player.zodiac} className="text-xl" />
                </button>

                <div className="flex flex-col select-none cursor-pointer text-left" onClick={() => onEditPlayer(player)}>
                  <span
                    className={`text-xs font-bold font-sans tracking-tight line-clamp-1 max-w-[65px]
                      ${isActive ? "text-white" : "text-neutral-450"}
                    `}
                  >
                    {player.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wide text-neutral-500">
                    {isActive ? "✨ ĐẾN LƯỢT" : `Thao tác #0${idx + 1}`}
                  </span>
                </div>

                {/* Tiny fast delete button */}
                <button
                  id={`remove_player_${player.id}`}
                  onClick={() => onRemovePlayer(player.id)}
                  className="ml-1 p-1 rounded-full text-neutral-500 hover:text-red-500 hover:bg-neutral-800/80 cursor-pointer opacity-70 hover:opacity-100 transition-all"
                  title="Xóa người chơi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Visual arrow mark in the diagram between players */}
              {idx < players.length - 1 && (
                <div className="text-neutral-700 text-xs font-mono font-black select-none pointer-events-none animate-pulse">
                  ➔
                </div>
              )}
            </div>
          );
        })}

        {/* Append a permanent customized +1 trigger at the very end of the horizontal row */}
        <button
          onClick={onAddPlayer}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 hover:bg-neutral-900/60 text-neutral-400 font-bold text-xs transition-all active:scale-95 cursor-pointer h-[50px]"
          title="Thêm người tham gia nhanh"
        >
          <span className="text-sm">➕</span>
          <span>Thêm bạn</span>
        </button>
      </div>
    </div>
  );
}
