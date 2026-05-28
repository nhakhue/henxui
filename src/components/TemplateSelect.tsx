import { PRESET_TEMPLATES } from "../data";
import { PresetTemplate } from "../types";

interface TemplateSelectProps {
  selectedPresetId: string;
  onSelect: (preset: PresetTemplate) => void;
  onCustomClick: () => void;
}

export default function TemplateSelect({
  selectedPresetId,
  onSelect,
  onCustomClick,
}: TemplateSelectProps) {
  return (
    <div className="w-full select-none">
      {/* Horizontally scrollable container */}
      <div className="flex gap-2.5 overflow-x-auto px-4 py-2 scrollbar-none snap-x snap-mandatory">
        {PRESET_TEMPLATES.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              id={`template_pill_${preset.id}`}
              onClick={() => onSelect(preset)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 snap-center cursor-pointer shadow-sm border
                ${isSelected
                  ? `bg-slate-900 border-slate-900 text-white shadow-md active:scale-95`
                  : `bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 active:scale-95`
                }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.name.replace(/^[^\s]+\s/, "")}</span> {/* Strip emoji icon prefix in label if needed */}
            </button>
          );
        })}

        {/* Custom option pill */}
        <button
          id="template_pill_custom"
          onClick={onCustomClick}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 snap-center cursor-pointer shadow-sm border
            ${selectedPresetId === "custom"
              ? "bg-slate-900 border-slate-900 text-white shadow-md"
              : "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-800"
            }`}
        >
          <span>✍️</span>
          <span>Tự tạo...</span>
        </button>
      </div>
    </div>
  );
}
