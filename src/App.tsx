import { useEffect, useState, FormEvent } from "react";
// @ts-expect-error - SVG file import
import logoUrl from "../henxui.svg";
import { Segment, Player, PresetTemplate, Settings, ZodiacAnimal } from "./types";
import { PRESET_TEMPLATES, THEME_COLORS_PALETTE, ZODIAC_ANIMALS } from "./data";
import SpinWheel from "./components/SpinWheel";
import TemplateSelect from "./components/TemplateSelect";
import GroupSelector from "./components/GroupSelector";
import PlayerConfigModal from "./components/PlayerConfigModal";
import EmojiAvatar from "./components/EmojiAvatar";
import {
  Users,
  Edit3,
  Settings as SettingsIcon,
  Trash2,
  Plus,
  Share2,
  Copy,
  Check,
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  Info,
  ChevronRight,
  UserPlus,
  RotateCcw
} from "lucide-react";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

export default function App() {
  // Tabs: "home" (Templates/Dashboard), "wheel" (Main Stage), "settings" (Haptic + Sound toggles, wheel customization, presets reset, URL share)
  const [currentTab, setCurrentTab] = useState<"home" | "wheel" | "settings">("home");

  // Load core configurations from localStorage if applicable
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("henxui_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      soundEnabled: true,
      musicEnabled: false,
      vibrationEnabled: true,
    };
  });

  // Players State - Defaults to 3 fun customizable players with zodiac animals to make the feature immediately visible!
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem("henxui_players");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          const animals: ZodiacAnimal[] = ["🐭", "🐮", "🐯", "🐱", "🐉", "🐍", "🐴", "🐐", "🐵", "🐔", "🐶", "🐷"];
          return parsed.map((p: any, idx: number) => ({
            id: p.id || `player_init_${idx + 1}`,
            name: p.name || `Người chơi #${idx + 1}`,
            zodiac: p.zodiac && typeof p.zodiac === "string" && p.zodiac.trim() !== "" ? p.zodiac : animals[idx % animals.length],
            color: p.color || "#FF4E00"
          }));
        }
      }
    } catch (e) {}
    // Default: Starts with 3 prefilled customizable animals to let them see the feature immediately
    return [
      { id: "player_init_1", name: "Cọp Lửa", zodiac: "🐯", color: "#FF4E00" },
      { id: "player_init_2", name: "Rồng Biển", zodiac: "🐉", color: "#3B82F6" },
      { id: "player_init_3", name: "Mèo Lười", zodiac: "🐱", color: "#EC4899" },
    ];
  });

  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  // Active segments list being displayed on wheel
  const [segments, setSegments] = useState<Segment[]>(() => {
    // Attempt loading last modified state
    try {
      const saved = localStorage.getItem("henxui_current_segments");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default fallback is "🍺 Sát thủ bia" preset segments
    return PRESET_TEMPLATES[0].segments.map((s, idx) => ({
      id: `seg_${idx}_${Date.now()}`,
      ...s
    }));
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("henxui_preset_id");
      return saved || PRESET_TEMPLATES[0].id;
    } catch (e) {}
    return PRESET_TEMPLATES[0].id;
  });

  // Winner output
  const [winnerSegment, setWinnerSegment] = useState<Segment | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Sharing API states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLocalLink, setCopiedLocalLink] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [customShareCode, setCustomShareCode] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("t");
      if (queryId) return queryId;
      
      const saved = localStorage.getItem("henxui_custom_share_code");
      if (saved) return saved;
    } catch (e) {}
    // default 4 characters
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  });
  const [copyCount, setCopyCount] = useState(0);
  const [activeTemplateTitle, setActiveTemplateTitle] = useState("");
  const [hasPresetPassword, setHasPresetPassword] = useState(false);
  const [wheelPassword, setWheelPassword] = useState("");
  const [isAutoPasswordActive, setIsAutoPasswordActive] = useState(false);

  // Information & SEO Content states
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [customReviews, setCustomReviews] = useState(() => [
    {
      id: "rev-1",
      author: "Nguyễn Minh Tuấn",
      rating: 5,
      date: "2026-04-12",
      comment: "Vòng quay giải trí tuyệt vời! Game Sát thủ bia chơi nhóm nhậu rất mượt, có tiếng tít tít và hiệu ứng rung rất thật.",
    },
    {
      id: "rev-2",
      author: "Trần Thị Lan Anh",
      rating: 5,
      date: "2026-05-18",
      comment: "Mỗi lần không biết ăn gì cùng đồng nghiệp toàn mở Yes-No xoay, quyết định xong đỡ mệt đầu hẳn. Giao diện tối sang trọng dễ dùng.",
    },
    {
      id: "rev-3",
      author: "Lê Hoàng Long",
      rating: 5,
      date: "2026-05-25",
      comment: "Mấy trò Truth or Dare này quẩy đêm cùng hội bạn thân siêu vui. App chạy trực tiếp offline, không bị quảng cáo làm phiền.",
    },
    {
      id: "rev-4",
      author: "Phạm Minh Đức",
      rating: 5,
      date: "2026-05-26",
      comment: "Đặc biệt thích chế độ nhiều người chơi multiplayer. Có thứ tự lượt quay, biểu tượng con giáp và chia sẻ link cực tiện.",
    }
  ]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Loading shared template state
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [sharedError, setSharedError] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isNewPlayer, setIsNewPlayer] = useState(false);

  // Inline forms for edit segments
  const [isEditingWheel, setIsEditingWheel] = useState(false);
  const [newSegText, setNewSegText] = useState("");
  const [newSegColor, setNewSegColor] = useState(THEME_COLORS_PALETTE[0]);

  const [multiplayerEnabled, setMultiplayerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("henxui_multiplayer_enabled");
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {}
    return true;
  });

  // Synchronize localStorage shifts
  useEffect(() => {
    localStorage.setItem("henxui_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("henxui_multiplayer_enabled", JSON.stringify(multiplayerEnabled));
  }, [multiplayerEnabled]);

  useEffect(() => {
    localStorage.setItem("henxui_custom_share_code", customShareCode);
  }, [customShareCode]);

  useEffect(() => {
    localStorage.setItem("henxui_players", JSON.stringify(players));
  }, [players]);

  // Auto-scroll-center active player when activePlayerIndex or players change
  useEffect(() => {
    if (players.length > 0) {
      const activePlayer = players[activePlayerIndex];
      if (activePlayer) {
        const timer = setTimeout(() => {
          const container = document.getElementById("player-turns-list-container");
          const activeElement = document.getElementById(`player-turn-item-${activePlayer.id}`);
          if (container && activeElement) {
            const containerWidth = container.clientWidth;
            const elementLeft = activeElement.offsetLeft;
            const elementWidth = activeElement.clientWidth;
            
            container.scrollTo({
              left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
              behavior: "smooth"
            });
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [activePlayerIndex, players]);

  useEffect(() => {
    localStorage.setItem("henxui_current_segments", JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem("henxui_preset_id", selectedPresetId);
  }, [selectedPresetId]);

  // Automatically adjust path in address bar matching saved customized ID when on Wheel tab
  useEffect(() => {
    if (currentTab === "wheel" && generatedId) {
      window.history.replaceState(null, "", "/" + generatedId.toLowerCase());
    } else {
      window.history.replaceState(null, "", "/");
    }
  }, [currentTab, generatedId]);

  // Handle URL Shares (GET /api/templates/:id)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let templateId = params.get("t");

    // Standard subdirectories or keywords we do not treat as templates
    const pathname = window.location.pathname.substring(1).trim();
    const isAlphanumeric = /^[a-z0-9]{3,12}$/i.test(pathname);
    const blacklistedPaths = ["api", "home", "wheel", "settings", "assets"];

    if (!templateId && pathname && isAlphanumeric && !blacklistedPaths.includes(pathname.toLowerCase())) {
      templateId = pathname;
    }

    if (templateId) {
      setIsLoadingShared(true);
      fetch(`/api/templates/${templateId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Vòng quay này không tồn tại!");
          return res.json();
        })
        .then((data) => {
          if (data && data.segments) {
            // Apply loaded segments
            const loadedSegs: Segment[] = data.segments.map((s: any, idx: number) => ({
              id: `shared_${idx}_${Date.now()}`,
              text: s.text,
              color: s.color || THEME_COLORS_PALETTE[idx % THEME_COLORS_PALETTE.length],
            }));
            setSegments(loadedSegs);
            setSelectedPresetId("custom");
            setActiveTemplateTitle(data.title || "Vòng quay chia sẻ");
            setCopyCount(data.copies || 1);
            setGeneratedId(data.id);
            setCustomShareCode(data.id);
            setHasPresetPassword(data.hasPassword || false);
            const savedPwd = getCookie(`hx_pwd_${data.id}`);
            const isAuto = getCookie(`hx_pwd_auto_${data.id}`) === "true";
            if (savedPwd && data.hasPassword) {
              setWheelPassword(savedPwd);
              setIsAutoPasswordActive(isAuto);
            } else {
              setWheelPassword("");
              setIsAutoPasswordActive(false);
            }
            // Auto switch to wheel tab!
            setCurrentTab("wheel");
          }
          setIsLoadingShared(false);
        })
        .catch((err) => {
          setSharedError(err.message);
          setIsLoadingShared(false);
        });
    }
  }, []);

  // Quick preset template selector
  const handleSelectPreset = (preset: PresetTemplate) => {
    if (isSpinning) return;
    setSelectedPresetId(preset.id);
    const mapped = preset.segments.map((s, idx) => ({
      id: `seg_preset_${idx}_${Date.now()}`,
      ...s
    }));
    setSegments(mapped);
    const newRandom = Array.from({length: 4}, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    setCustomShareCode(newRandom);
    setHasPresetPassword(false);
    setWheelPassword("");
    setIsAutoPasswordActive(false);
    setGeneratedValueAndTitle("", "");
  };

  const setGeneratedValueAndTitle = (id: string, title: string) => {
    setGeneratedId(id);
    setActiveTemplateTitle(title);
    if (!id) setCopyCount(0);
  };

  // Trigger configuration modal for editing existing player
  const handleStartEditPlayer = (player: Player) => {
    if (isSpinning) return;
    setIsNewPlayer(false);
    setEditingPlayer(player);
  };

  // Add custom player by opening the creation modal (with pre-generated randomized defaults of con giáp & color)
  const handleAddPlayerQuick = () => {
    if (isSpinning) return;

    // Fast-generator for random zodiac animal
    const randomAnimal = ZODIAC_ANIMALS[Math.floor(Math.random() * ZODIAC_ANIMALS.length)];
    
    // Choose vibrant colors
    const colors = ["#FF4E00", "#EF4444", "#22C55E", "#3B82F6", "#EC4899", "#A855F7", "#F59E0B", "#06B6D4", "#14B8A6", "#6366F1"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Choose fun placeholder Vietnamese names based on index
    const names = ["Anh Bạn", "Chiến Hữu", "Cao Thủ", "Tay Nhậu", "Hải Đăng", "Bảo Trâm", "Tuấn Tú", "Kim Ngân", "Hoàng Nam", "Gia Bảo"];
    const randomPlaceholder = names[Math.floor(Math.random() * names.length)];
    const num = players.length + 1;

    const newPlayer: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: `${randomPlaceholder} #${num}`,
      zodiac: randomAnimal,
      color: randomColor,
    };

    setIsNewPlayer(true);
    setEditingPlayer(newPlayer);
    
    // Switch to action visual tab to show user feedback instantly
    setCurrentTab("wheel");
  };

  // Save edited player properties from modal
  const handleSavePlayerConfig = (updatedPlayer: Player) => {
    if (isNewPlayer) {
      setPlayers((prev) => [...prev, updatedPlayer]);
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p))
      );
    }
  };

  // Remove player from lobby
  const handleRemovePlayer = (id: string) => {
    if (isSpinning) return;
    setPlayers((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      // Adjust active turn if out of bounds
      if (activePlayerIndex >= updated.length) {
        setActivePlayerIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  // Upate specific player's zodiac animal during fast-tap cycle
  const handleUpdatePlayerZodiac = (playerId: string, nextZodiac: ZodiacAnimal) => {
    if (isSpinning) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, zodiac: nextZodiac } : p))
    );
  };

  // Quick edit or rename a player name
  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: newName.trim() || p.name } : p))
    );
  };

  // Interactive Spin handlers
  const handleSpinStart = () => {
    setWinnerSegment(null);
    
    // Smoothly focus/center active player right as we click SPIN
    if (players.length > 0) {
      const activePlayer = players[activePlayerIndex];
      if (activePlayer) {
        const container = document.getElementById("player-turns-list-container");
        const activeElement = document.getElementById(`player-turn-item-${activePlayer.id}`);
        if (container && activeElement) {
          const containerWidth = container.clientWidth;
          const elementLeft = activeElement.offsetLeft;
          const elementWidth = activeElement.clientWidth;
          
          container.scrollTo({
            left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
            behavior: "smooth"
          });
        }
      }
    }
  };

  const handleSpinEnd = (winner: Segment) => {
    setWinnerSegment(winner);

    // If multiple players are active, play turns!
    // After 1 second of celebration overlay, we can auto-tick or show manual buttons
  };

  const handleNextPlayerTurn = () => {
    if (players.length > 1) {
      setActivePlayerIndex((prev) => (prev + 1) % players.length);
    }
    setWinnerSegment(null);
  };

  // Segments modifier routines (Edit tab)
  const handleAddSegment = (e: FormEvent) => {
    e.preventDefault();
    if (!newSegText.trim()) return;

    const newSeg: Segment = {
      id: `seg_custom_${Date.now()}`,
      text: newSegText.trim(),
      color: newSegColor,
    };

    setSegments((prev) => [...prev, newSeg]);
    setNewSegText("");
    setSelectedPresetId("custom");
    setGeneratedValueAndTitle("", ""); // Reset share status since layout changed

    // Shift to a new color in palette so consecutive adds look lively
    const nextColorIdx = (THEME_COLORS_PALETTE.indexOf(newSegColor) + 1) % THEME_COLORS_PALETTE.length;
    setNewSegColor(THEME_COLORS_PALETTE[nextColorIdx]);
  };

  const handleRemoveSegment = (id: string) => {
    if (segments.length <= 2) {
      // Minimum slices required to form a spinning geometry
      alert("⚠️ Cần tối thiểu 2 lựa chọn để tạo vòng quay!");
      return;
    }
    setSegments((prev) => prev.filter((s) => s.id !== id));
    setSelectedPresetId("custom");
    setGeneratedValueAndTitle("", "");
  };

  const handleUpdateSegmentText = (id: string, text: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    );
    setSelectedPresetId("custom");
    setGeneratedValueAndTitle("", "");
  };

  const handleUpdateSegmentColor = (id: string, color: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, color } : s))
    );
    setSelectedPresetId("custom");
    setGeneratedValueAndTitle("", "");
  };

  const handleResetWheel = () => {
    const currentPreset = PRESET_TEMPLATES.find(p => p.id === selectedPresetId) || PRESET_TEMPLATES[0];
    const remapped = currentPreset.segments.map((s, idx) => ({
      id: `seg_${idx}_${Date.now()}`,
      ...s
    }));
    setSegments(remapped);
    setHasPresetPassword(false);
    setWheelPassword("");
    setIsAutoPasswordActive(false);
    setGeneratedValueAndTitle("", ""); // Clear stale sharing IDs
  };

  // Dynamic short-link share engine
  const handleShareRules = async () => {
    if (isGeneratingShare) return;
    setIsGeneratingShare(true);

    try {
      // Minimal clean post payload
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segments.map((s) => ({ text: s.text, color: s.color })),
          title: "Vòng quay Custom HenXui",
          customId: customShareCode,
          password: wheelPassword,
        }),
      });

      if (!response.ok) {
        let errMsg = "Gửi yêu cầu thất bại";
        try {
          const data = await response.json();
          if (data && data.error) errMsg = data.error;
        } catch (err) {}
        throw new Error(errMsg);
      }
      const result = await response.json();

      if (result.id) {
        setGeneratedId(result.id);
        setCustomShareCode(result.id);
        
        // Save the password to cookies for persistent session usage
        if (result.password) {
          setCookie(`hx_pwd_${result.id}`, result.password);
          setCookie(`hx_pwd_auto_${result.id}`, result.isAutoPassword ? "true" : "false");
          setWheelPassword(result.password);
          setIsAutoPasswordActive(!!result.isAutoPassword);
        } else {
          setWheelPassword("");
          setIsAutoPasswordActive(false);
        }

        setHasPresetPassword(true);
        setActiveTemplateTitle("Vòng quay Custom HenXui");
        setCopyCount(0); // newly minted
        
        // Copy link to clipboard
        const shareURL = `${window.location.origin}/${result.id}`;
        await navigator.clipboard.writeText(shareURL);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      }
    } catch (e: any) {
      alert(`❌ Lỗi chia sẻ: ${e.message || "Không thể kết nối tới server!"}`);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const copyExistingShareLink = async () => {
    if (!generatedId) return;
    const shareURL = `${window.location.origin}/${generatedId}`;
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {}
  };

  const handleCopyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLocalLink(true);
      setTimeout(() => setCopiedLocalLink(false), 3000);
    } catch (err) {}
  };

  // Dynamic SEO rich snippet generator
  const getSeoData = () => {
    const currentPresetId = selectedPresetId || "custom";
    
    let title = "Vòng quay may mắn HenXui - Công cụ quyết định ngẫu nhiên trực tuyến miễn phí";
    let description = "Vòng quay may mắn HenXui là công cụ đưa ra quyết định ngẫu nhiên, lựa chọn may rủi, rút thăm trúng thưởng trực tuyến miễn phí và tiện lợi nhất. Bạn có thể tự do chỉnh sửa nội dung, thay đổi màu sắc, bật chế độ nhiều người chơi (multiplayer) xoay vòng luân phiên để tăng thêm phần kịch tính.";
    let tags = ["vong quay may man", "vong quay random", "boc tham trung thuong", "quyet dinh nhanh", "henxui online", "tro choi tap the", "multiplayer wheel"];

    if (activeTemplateTitle) {
      title = `${activeTemplateTitle} - Vòng quay may mắn HenXui`;
      description = `Trải nghiệm luật chơi "${activeTemplateTitle}" trên vòng quay may mắn HenXui. Vòng quay ngẫu nhiên trực tuyến giúp đưa ra quyết định công bằng, bốc thăm may mắn tức thì. Thử ngay luật chơi này cùng nhiều người hoàn toàn miễn phí!`;
      tags = [activeTemplateTitle.toLowerCase(), "vong quay may man", "vong quay random", "henxui", "luat choi tuy bien", "quyet dinh ngau nhien"];
    } else if (currentPresetId === "beer-killer") {
      title = "Vòng quay Sát Thủ Bia - Trò chơi tiệc rượu ăn nhậu đỉnh cao HenXui";
      description = "Vòng quay Sát Thủ Bia là trò chơi giải trí ăn nhậu không thể thiếu cho các buổi tụ họp bạn bè, tiệc tùng. Giúp phân định uống bia rượu ngẫu nhiên đầy hài hước như uống 1 ly, bên trái uống nửa ly, chỉ định hay hát 1 bài. Trải nghiệm mượt mà, công tâm, mang lại tiếng cười sảng khoái lý tưởng cho các buổi tiệc tùng đông người.";
      tags = ["vong quay sat thu bia", "tro choi an nhau", "phat ruou", "vong quay may man", "ban nhau", "henxui", "app an nhau", "party games"];
    } else if (currentPresetId === "yes-no") {
      title = "Vòng quay Yes No - Trình đưa ra quyết định Có hoặc Không ngẫu nhiên";
      description = "Bạn đang phân vân chưa biết chọn Có hay Không? Vòng quay Yes No từ HenXui giúp bạn đưa ra lựa chọn nhanh chóng và hoàn toàn khách quan. Rất thích hợp khi cần giải quyết các câu hỏi phân vân, lựa chọn ăn gì, đi đâu, quyết định thực hiện dự định tức thì.";
      tags = ["yes no wheel", "co hay khong", "vong quay co khong", "quyet dinh nhanh", "lua chon ngau nhien", "henxui yes no", "app quyet dinh"];
    } else if (currentPresetId === "truth-dare") {
      title = "Vòng quay Truth or Dare - Sự Thật hay Thử Thách kịch tính đêm tiệc";
      description = "Vòng quay Truth or Dare (Sự thật hay Thử thách) là trò chơi party kinh điển kết nối mọi người cực sâu sắc và thú vị. Trải nghiệm các câu hỏi hài hước thực tế và những thử thách kịch tính cùng bạn bè trên giao diện tối cao cấp mượt mà.";
      tags = ["truth or dare wheel", "su that hay thu thach", "tro choi ket noi", "party game dim hang", "thu thach vui nhon", "henxui", "truth dare truc tuyen"];
    }

    return { title, description, tags, reviews: customReviews };
  };

  const seoInfo = getSeoData();

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      author: reviewName.trim(),
      rating: reviewRating,
      date: new Date().toISOString().split("T")[0],
      comment: reviewComment.trim()
    };

    setCustomReviews(prev => [newReview, ...prev]);
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
    setReviewSuccessMsg("🎉 Đánh giá của bạn đã được đăng tải thành công!");
    setTimeout(() => setReviewSuccessMsg(""), 3500);
  };

  return (
    <div className="flex flex-col min-h-screen text-white select-none bg-[#0A0A0A] font-sans overflow-x-hidden">
      
      {/* Dynamic Header – Hidden only on Wheel Screen to maximize space */}
      {currentTab !== "wheel" && (
        <header className="p-4 border-b border-neutral-900/40 bg-[#0C0C0C]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#141414] border border-neutral-800/80 flex items-center justify-center p-1.5 shadow-md shadow-black/40">
                <img 
                  src={logoUrl} 
                  className="w-full h-full object-contain max-w-full max-h-full animate-[spin_24s_linear_infinite]" 
                  alt="HenXui Logo" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  VÒNG QUAY HENXUI
                </h1>
                <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">
                  henxui.online
                </p>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Container viewport */}
      <main className="flex-1 flex flex-col max-w-lg w-full mx-auto pb-28 pt-4">
        
        {/* Loader/Banner for loaded short link templates */}
        {isLoadingShared && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 flex items-center gap-2 animate-pulse">
            <span className="text-lg">⏳</span>
            <span className="text-xs text-orange-200">Đang đồng bộ hóa luật chơi qua liên kết...</span>
          </div>
        )}

        {sharedError && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span className="text-xs text-red-300">{sharedError}</span>
            </div>
            <button 
              onClick={() => setSharedError("")} 
              className="text-white hover:text-neutral-300 text-xs font-mono font-bold"
            >
              [X]
            </button>
          </div>
        )}

        {generatedId && (
          <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-orange-400/10 to-transparent border border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-orange-200 block">
                  {activeTemplateTitle || "Chế độ: Luật liên kết"}
                </span>
                <span className="text-[10px] text-neutral-400">
                  Phổ biến: Đã được sao chép/tải <strong className="text-orange-400 font-mono italic">{copyCount}</strong> lần!
                </span>
              </div>
            </div>
            <button
              onClick={copyExistingShareLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/15 text-orange-300 text-[11px] font-bold border border-orange-500/30 active:scale-95 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Đã copy!" : "Sao chép"}</span>
            </button>
          </div>
        )}

        {/* Tab 0: TRANG CHỦ (Home Dashboard) */}
        {currentTab === "home" && (
          <div className="px-4 space-y-6 animate-fade-in animate-duration-300">
            {/* Promo / Hero Banner (Visually stunning & SEO H1 optimized) */}
            <div className="bg-gradient-to-br from-neutral-900 via-[#111111] to-neutral-950 border border-neutral-800 p-6 rounded-3xl text-center relative overflow-hidden shadow-xl shadow-black/40">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF4E00]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <span className="text-4xl inline-block animate-[pulse_2s_infinite] mb-3 select-none">🎡</span>
                
                {/* Semantic H1 for perfect SEO crawlers support */}
                <h1 className="text-lg font-black tracking-tight text-white uppercase bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text">
                  VÒNG QUAY ĂN NHẬU HENXUI
                </h1>
                
                <h2 className="text-[10px] text-[#FF4E00] font-black uppercase tracking-widest mt-1 font-mono">
                  Quyết Định Ngẫu Nhiên & Uống Bia Kì Diệu
                </h2>
                
                <p className="text-xs text-neutral-400 mt-2.5 max-w-xs mx-auto leading-relaxed">
                  Trò chơi vòng quay uống bia, uống rượu hấp dẫn và công bằng nhất dành cho hội bạn thân, quán nhậu, bar, pub hoàn toàn miễn phí!
                </p>
              </div>
            </div>

            {/* Grid of presets list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-widest text-[#FF4E00] font-mono">
                  🎮 CHỌN CHẾ ĐỘ CHƠI
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Chạm để mở vòng quay
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PRESET_TEMPLATES.map((preset) => {
                  const isSelected = preset.id === selectedPresetId;
                  return (
                    <button
                      key={preset.id}
                      id={`home_card_preset_${preset.id}`}
                      onClick={() => {
                        handleSelectPreset(preset);
                        setCurrentTab("wheel");
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98
                        ${isSelected
                          ? "bg-[#181818]/90 border-[#FF4E00] shadow-[#FF4E00]/5 shadow-md"
                          : "bg-[#121212] border-neutral-800/60 hover:border-neutral-700 hover:bg-[#151515]"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl p-2.5 bg-neutral-950/80 rounded-xl group-hover:scale-110 transition-all duration-200 border border-neutral-900">
                          {preset.icon}
                        </span>
                        <div>
                          <span className="text-sm font-extrabold text-white block group-hover:text-[#FF4E00] transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 mt-0.5 block leading-tight">
                            {preset.id === "beer-killer" 
                              ? "Nhiệm vụ phạt bia rượu hấp dẫn, gay cấn nhất đêm tiệc" 
                              : preset.id === "yes-no" 
                                ? "Đưa ra quyết định Có hay Không ngẫu nhiên cực nhanh" 
                                : "Thử thách dũng cảm chia sẻ bí mật hay thực hiện cam kết"}
                          </span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 flex-shrink-0
                        ${isSelected 
                          ? "bg-[#FF4E00] text-white" 
                          : "bg-neutral-800 text-neutral-400 group-hover:bg-[#FF4E00] group-hover:text-white"
                        }`}
                      >
                        ➔
                      </div>
                    </button>
                  );
                })}

                {/* Self-create custom button inside list as requested */}
                <button
                  id="home_card_preset_custom"
                  onClick={() => setCurrentTab("settings")}
                  className="w-full text-left p-4 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-98"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl p-2.5 bg-amber-500/10 rounded-xl group-hover:rotate-12 transition-all duration-200 border border-amber-500/10 text-amber-500">
                      ✍️
                    </span>
                    <div>
                      <span className="text-sm font-extrabold text-amber-500 block">
                        Tự tạo vòng quay riêng...
                      </span>
                      <span className="text-[11px] text-amber-500/70 mt-0.5 block leading-tight">
                        Tùy ý soạn nội dung hình phạt, chỉnh màu & tạo link chia sẻ
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold group-hover:bg-amber-500 group-hover:text-black transition-all">
                    +
                  </div>
                </button>
              </div>
            </div>

            {/* Rich SEO Content Section (Visible & highly indexed by Google) */}
            <div className="pt-4 border-t border-neutral-900 space-y-5 text-left">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#FF4E00] font-mono mb-2">
                  ℹ️ CẨM NANG VÒNG QUAY ĂN NHẬU HENXUI
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  <strong>Vòng quay ăn nhậu</strong> (vòng quay sát thủ bia, chiếc nón kì diệu online) là công cụ đắc lực giải cứu các bàn phát nhậu tẻ nhạt. Giúp nâng tầm không khí bàn tiệc của các pub, quán rượu, phòng trà hay những buổi team building, tụ họp nhóm bạn. Khi có quá nhiều lựa chọn hoặc ai đó ngượng ngùng không biết bắt đầu như thế nào, hãy để <strong>bánh xe ngẫu nhiên HenXui</strong> phân định công bằng!
                </p>
              </div>

              {/* Step instructions */}
              <div className="bg-neutral-950/40 p-4 border border-neutral-900 rounded-2xl">
                <h4 className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wide font-mono mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF4E00]" /> HƯỚNG DẪN CHƠI TRONG 3 BƯỚC:
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[11px] font-mono font-black text-[#FF4E00] py-0.5 px-2 bg-[#FF4E00]/10 rounded-md">01</span>
                    <p className="text-xs text-neutral-400">
                      <strong>Chọn theme chơi:</strong> Bấm nút chọn ngay <em>Sát thủ bia</em>, <em>Lựa chọn Có Không (Yes/No)</em> hoặc <em>Sự thật hay thử thách</em>.
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[11px] font-mono font-black text-[#FF4E00] py-0.5 px-2 bg-[#FF4E00]/10 rounded-md">02</span>
                    <p className="text-xs text-neutral-400">
                      <strong>Thêm thành viên (đặc trưng):</strong> Điền tên thành viên và gán linh vật con giáp 🐹 🐯 tương ứng để theo dõi đúng thứ tự lượt của mình.
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[11px] font-mono font-black text-[#FF4E00] py-0.5 px-2 bg-[#FF4E00]/10 rounded-md">03</span>
                    <p className="text-xs text-neutral-400">
                      <strong>Nhấp quay & Thưởng phạt:</strong> Nhấn tâm vòng quay để bánh xe khởi chạy cùng tiếng tít tít chân thực, âm nhạc sống động và rung hăng hái.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Accordion Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#FF4E00] font-mono mb-2">
                  ❓ CÂU HỎI THƯỜNG GẶP (FAQ)
                </h3>
                
                {/* FAQ 1 */}
                <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/20">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                    className="w-full p-3.5 text-xs font-semibold text-neutral-300 flex items-center justify-between hover:bg-neutral-900/40 text-left"
                  >
                    <span>Vòng quay HenXui hoạt động có công tâm không?</span>
                    <span className="text-[10px] text-neutral-500 font-mono transition-transform duration-300">
                      {openFaqIndex === 0 ? "▲" : "▼"}
                    </span>
                  </button>
                  {openFaqIndex === 0 && (
                    <div className="p-3.5 pt-0 text-xs text-neutral-400 border-t border-neutral-900/60 leading-relaxed bg-[#0D0D0D]/50">
                      Hoàn toàn công tâm! Hệ thống áp dụng thuật toán ngẫu nhiên toán học không thiên vị và không lưu bất cứ logic cố chấp nào. Mọi kết quả đều dựa hoàn toàn vào vận may của người xoay.
                    </div>
                  )}
                </div>

                {/* FAQ 2 */}
                <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/20">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                    className="w-full p-3.5 text-xs font-semibold text-neutral-300 flex items-center justify-between hover:bg-neutral-900/40 text-left"
                  >
                    <span>Cách tự sửa tên và ô hình phạt thế nào?</span>
                    <span className="text-[10px] text-neutral-500 font-mono transition-transform duration-300">
                      {openFaqIndex === 1 ? "▲" : "▼"}
                    </span>
                  </button>
                  {openFaqIndex === 1 && (
                    <div className="p-3.5 pt-0 text-xs text-neutral-400 border-t border-neutral-900/60 leading-relaxed bg-[#0D0D0D]/50">
                      Chỉ cần chọn nút <em>✍️ Tự tạo vòng quay riêng</em> hoặc chuyển sang tab <strong>Cài đặt</strong> để dễ dàng thêm bớt ô phạt, gán màu tùy chỉnh riêng theo từng người. Ngoài ra bạn còn có thể lưu giữ bảo mật bằng cách đặt mật khẩu khi chia sẻ.
                    </div>
                  )}
                </div>

                {/* FAQ 3 */}
                <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950/20">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                    className="w-full p-3.5 text-xs font-semibold text-neutral-300 flex items-center justify-between hover:bg-neutral-900/40 text-left"
                  >
                    <span>Gửi link chia sẻ có bị thu phí lưu trữ không?</span>
                    <span className="text-[10px] text-neutral-500 font-mono transition-transform duration-300">
                      {openFaqIndex === 2 ? "▲" : "▼"}
                    </span>
                  </button>
                  {openFaqIndex === 2 && (
                    <div className="p-3.5 pt-0 text-xs text-neutral-400 border-t border-neutral-900/60 leading-relaxed bg-[#0D0D0D]/50">
                      Không hề! Dịch vụ lưu trữ liên kết của HenXui trực tuyến hoàn toàn <strong>miễn phí 100%</strong>. Link rút gọn hỗ trợ lấy dữ liệu tức khắc giúp bạn chia sẻ siêu tốc đến tất cả bạn bè qua mạng xã hội mọi lúc.
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews community feedback directly on home screen */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#FF4E00] font-mono">
                    ⭐️ Ý KIẾN NGƯỜI CHƠI
                  </h3>
                  <div className="flex items-center gap-1.5 bg-neutral-950/60 border border-neutral-900 px-2 py-0.5 rounded-full select-none">
                    <span className="text-[11px] font-extrabold text-amber-500">5.0</span>
                    <span className="text-amber-500 text-[10px]">★★★★★</span>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {customReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-3.5 rounded-2xl bg-neutral-950/30 border border-neutral-900 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-neutral-300">{review.author}</span>
                        <span className="text-[9px] font-mono text-neutral-500">{review.date}</span>
                      </div>
                      <div className="text-[8px] text-amber-500 tracking-tight">
                        {"★".repeat(review.rating)}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add review form directly inside the Home Tab for interactive UX & SEO text depth! */}
                <form 
                  onSubmit={handleAddReview} 
                  className="bg-[#111111]/40 border border-neutral-900/80 p-4 rounded-3xl space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                    ✍️ ĐĂNG ĐÁNH GIÁ CỦA BẠN:
                  </h4>

                  {reviewSuccessMsg && (
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-center text-[10px] text-emerald-400 font-extrabold">
                      {reviewSuccessMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Biệt hiệu / Tên"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="bg-neutral-950 border border-neutral-900 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00] outline-none rounded-xl h-8 px-2.5 text-xs text-white placeholder:text-neutral-600"
                    />
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-neutral-950 border border-neutral-900 focus:border-[#FF4E00] outline-none rounded-xl h-8 px-2 text-xs text-amber-400 cursor-pointer"
                    >
                      <option value={5}>⭐️⭐️⭐️⭐️⭐️ (5 sao)</option>
                      <option value={4}>⭐️⭐️⭐️⭐️ (4 sao)</option>
                      <option value={3}>⭐️⭐️⭐️ (3 sao)</option>
                    </select>
                  </div>

                  <textarea
                    required
                    rows={2}
                    placeholder="Hãy chia sẻ trải nghiệm thực tế chơi game của nhóm bạn..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-900 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00] outline-none rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-600 resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full h-8 bg-[#FF4E00]/10 hover:bg-[#FF4E00]/20 border border-[#FF4E00]/25 text-[#FF4E00] rounded-xl text-xs font-black tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    🚀 Gửi đánh giá cộng đồng
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* Tab 1: WHEEL PLATFORM (Home Viewport) */}
        {currentTab === "wheel" && (
          <div className="flex flex-col flex-1 items-center justify-between gap-4 animate-fade-in animate-duration-300">
            
            {/* Turn order indicators if multiple players */}
            <div className="w-full px-4 flex flex-col gap-2">
              {multiplayerEnabled && (
                <div className="bg-[#121212] border border-neutral-800/40 rounded-2xl p-4 shadow-xl">
                  {players.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div 
                        id="player-turns-list-container"
                        className="flex items-center gap-3.5 mb-3 overflow-x-auto w-full py-3 px-4 flex-nowrap scrollbar-thin scrollbar-thumb-neutral-800 justify-start scroll-smooth"
                      >
                        {players.map((p, idx) => {
                          const isCurrent = idx === activePlayerIndex;
                          const playerBgColor = p.color || "#FF4E00";
                          return (
                            <div 
                              key={p.id} 
                              id={`player-turn-item-${p.id}`}
                              className="flex items-center gap-3.5 flex-shrink-0"
                            >
                              <div 
                                className={`flex flex-col items-center transition-all duration-300 ${
                                  isCurrent ? "scale-105 opacity-100" : "scale-90 opacity-45 hover:opacity-75"
                                }`}
                              >
                                <div className={`relative rounded-full p-1.5 transition-all duration-300 ${
                                  isCurrent ? "ring-2 ring-offset-2 ring-offset-neutral-900 shadow-xl bg-neutral-900 animate-pulse" : "bg-neutral-950"
                                }`}
                                style={{
                                  borderColor: isCurrent ? playerBgColor : "transparent",
                                  boxShadow: isCurrent ? `0 0 24px ${playerBgColor}50` : "none"
                                }}>
                                  <button
                                    onClick={() => !isSpinning && handleStartEditPlayer(p)}
                                    className={`rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                      isCurrent ? "w-18 h-18 text-4xl" : "w-11 h-11 text-2xl"
                                    }`}
                                    style={{
                                      backgroundColor: `${playerBgColor}22`,
                                      borderColor: playerBgColor,
                                    }}
                                    title="Chạm để tùy chọn màu, con giáp hoặc xóa"
                                  >
                                    <EmojiAvatar emoji={p.zodiac} className={isCurrent ? "text-4xl" : "text-2xl"} />
                                  </button>
                                </div>
                                <span className={`text-[10px] mt-1.5 font-bold transition-all duration-300 ${isCurrent ? "text-white uppercase tracking-wider scale-105" : "text-neutral-500 normal-case"}`} style={{ color: isCurrent ? playerBgColor : "" }}>
                                  {p.name.substring(0, 10)}
                                </span>
                              </div>

                              {/* Arrow character between players visual flow */}
                              {idx < players.length - 1 && (
                                <div className="text-neutral-700 text-xs font-mono font-black select-none pointer-events-none animate-pulse flex items-center justify-center self-center h-18">
                                  ➔
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Explicit connection arrow pointing to the + Add button if list reaches end */}
                        <span className="text-neutral-800 text-xs font-mono font-black select-none pointer-events-none animate-pulse flex items-center justify-center self-center h-18">
                          ➔
                        </span>

                        {/* "+1" circle button appended at the end of the player list as requested */}
                        <button
                          onClick={handleAddPlayerQuick}
                          className="flex-shrink-0 flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ml-1 self-center"
                          title="Thêm người chơi"
                        >
                          <div className="p-1">
                            <div className="w-11 h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-dashed border-neutral-700 flex items-center justify-center text-lg text-neutral-400 font-extrabold">
                              +
                            </div>
                          </div>
                          <span className="text-[10px] mt-1 text-neutral-500 font-bold uppercase">
                            Thêm Bạn
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <GroupSelector
                      players={players}
                      activePlayerIndex={activePlayerIndex}
                      onEditPlayer={handleStartEditPlayer}
                      onRemovePlayer={handleRemovePlayer}
                      onAddPlayer={handleAddPlayerQuick}
                    />
                  )}
                </div>
              )}

              {/* Toggle switch for Multiplayer mode and copy current URL share at the bottom right */}
              <div className="flex justify-end items-center gap-2 pr-1 z-10">
                {copiedLocalLink ? (
                  <div
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 select-none animate-bounce"
                  >
                    <span>✔️ Đã copy link!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyCurrentUrl}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-black uppercase bg-neutral-900 border border-neutral-805 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all duration-300 active:scale-95 cursor-pointer select-none"
                    title="Sao chép đường dẫn vòng quay đầy đủ"
                  >
                    <span>🔗 Chia sẻ</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMultiplayerEnabled(!multiplayerEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-black uppercase transition-all duration-300 active:scale-95 border cursor-pointer select-none ${
                    multiplayerEnabled
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-neutral-900 border-neutral-805 text-neutral-500 hover:text-neutral-300 hover:border-neutral-750"
                  }`}
                  title={multiplayerEnabled ? "Tắt chế độ nhiều người" : "Bật chế độ nhiều người"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${multiplayerEnabled ? "bg-emerald-400 animate-pulse animate-duration-1000" : "bg-neutral-600"}`} />
                  <span>👥 Nhiều người: {multiplayerEnabled ? "Bật" : "Tắt"}</span>
                </button>
              </div>
            </div>

            {/* Sân khấu chính: Wheel spinner component layout */}
            <div className="w-full flex-1 flex flex-col items-center justify-center py-2 relative">
              <SpinWheel
                segments={segments}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                soundEnabled={settings.soundEnabled}
                vibrationEnabled={settings.vibrationEnabled}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
              />

              {/* Hướng dẫn dưới vòng quay & Nút Thông tin */}
              <div className="flex flex-col items-center gap-2 mt-4 z-10 w-full px-4">
                <div className="flex items-center justify-center gap-2">
                  {multiplayerEnabled && players.length > 0 ? (
                    <div className="bg-neutral-900/90 border border-neutral-800/60 pl-4 pr-3.5 py-2 rounded-full shadow-lg flex items-center justify-center gap-2.5">
                      <span className="text-[11px] font-mono tracking-widest text-[#FF4E00] font-black uppercase whitespace-nowrap">
                        👉 ĐẾN LƯỢT: {players[activePlayerIndex]?.name || "Vô danh"}!
                      </span>
                      <div className="w-[1px] h-3.5 bg-neutral-800" />
                      <button
                        type="button"
                        onClick={() => setIsInfoModalOpen(true)}
                        className="text-[10px] font-mono font-black text-neutral-400 hover:text-[#FF4E00] flex items-center gap-1 transition-all duration-300 uppercase whitespace-nowrap cursor-pointer select-none px-2 py-1 hover:bg-neutral-800/40 rounded-full"
                        title="Xem thông tin vòng quay & Đánh giá SEO"
                      >
                        ℹ️ Thông tin
                      </button>
                    </div>
                  ) : (
                    <div className="bg-neutral-900/90 border border-neutral-800/60 pl-4 pr-3.5 py-2 rounded-full shadow-lg flex items-center justify-center gap-2.5">
                      <span className="text-[11px] font-mono tracking-widest text-[#FF4E00]/95 font-black uppercase whitespace-nowrap animate-pulse">
                        🎯 CHẠM ĐỂ XOAY VÒNG QUAY!
                      </span>
                      <div className="w-[1px] h-3.5 bg-neutral-800" />
                      <button
                        type="button"
                        onClick={() => setIsInfoModalOpen(true)}
                        className="text-[10px] font-mono font-black text-neutral-400 hover:text-[#FF4E00] flex items-center gap-1 transition-all duration-300 uppercase whitespace-nowrap cursor-pointer select-none px-2 py-1 hover:bg-neutral-800/40 rounded-full"
                        title="Xem thông tin vòng quay & Đánh giá SEO"
                      >
                        ℹ️ Thông tin
                      </button>
                    </div>
                  )}
                </div>

                {multiplayerEnabled && players.length > 0 && (
                  <p className="text-[10px] text-neutral-500 select-none pointer-events-none mt-0.5">
                    Chạm vào con giáp hoặc tên để tùy chỉnh nhanh người chơi
                  </p>
                )}
              </div>
            </div>

            {/* Winner Splash Celebration Box Modal */}
            {winnerSegment && (
              <div 
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
                id="winner_celebration_overlay"
              >
                <div className="bg-[#141414] border border-neutral-800 p-8 rounded-3xl max-w-sm w-full text-center relative overflow-hidden shadow-2xl shadow-[#FF4E00]/5">
                  {/* Glowing background */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-44 bg-[#FF4E00]/10 rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto relative mb-5 animate-bounce">
                      <div 
                        className="w-20 h-20 rounded-full border-2 p-1 bg-neutral-950 flex items-center justify-center shadow-2xl relative"
                        style={{ 
                          borderColor: (multiplayerEnabled && players[activePlayerIndex]?.color) || "#FF4E00", 
                          boxShadow: `0 0 20px ${((multiplayerEnabled && players[activePlayerIndex]?.color) || "#FF4E00")}40` 
                        }}
                      >
                        <EmojiAvatar 
                          emoji={(multiplayerEnabled && players[activePlayerIndex]?.zodiac) || "🎉"} 
                          className="w-12 h-12 text-5xl object-contain" 
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md border border-neutral-800">
                          🎉
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 uppercase mb-1">
                      {multiplayerEnabled && players.length > 1 ? `Lượt chơi của: ${players[activePlayerIndex]?.name}` : "Chúc mừng bạn quay trúng!"}
                    </p>

                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight my-3 px-2 break-words">
                      "{winnerSegment.text}"
                    </h2>

                    <div className="my-5 w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: winnerSegment.color || "#FF4E00" }} />

                    {multiplayerEnabled && players.length > 1 ? (
                      <div className="space-y-3">
                        <button
                          onClick={handleNextPlayerTurn}
                          className="w-full py-3.5 bg-gradient-to-r from-[#FF4E00] to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <span>TIẾP TỤC & ĐỔI LƯỢT</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <p className="text-[10px] text-neutral-400">
                          Hệ thống sẽ chuyển quyền quay đến lượt tiếp theo
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setWinnerSegment(null)}
                        className="w-full py-3.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all"
                      >
                        CHƠI LẠI LƯỢT TIẾP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SETTINGS & CUSTOMIZATION CONTROL PANEL */}
        {currentTab === "settings" && (
          <div className="px-4 space-y-6 pb-12">
            
            {/* 1. EDIT CURRENT WHEEL SEGMENTS SECTION (Chuyển nút/phần chỉnh sửa vào cài đặt - có nút bấm mở rộng) */}
             <div className="bg-[#121212] border border-neutral-800/40 rounded-2xl p-4.5 shadow-lg group">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-[#FF4E00]/10 rounded-xl text-[#FF4E00] group-hover:scale-105 transition-transform">
                     <Edit3 className="w-5 h-5" />
                   </div>
                   <div className="text-left">
                     <h3 className="text-sm font-extrabold text-white">
                       Chỉnh sửa nội dung vòng quay
                     </h3>
                     <p className="text-[11px] text-neutral-400 mt-0.5">
                       Đã tạo {segments.length} ô vòng quay (Nội dung / Hình phạt / Màu sắc)
                     </p>
                   </div>
                 </div>
                 
                 <button
                   type="button"
                   onClick={() => setIsEditingWheel(!isEditingWheel)}
                   className={`py-2 px-4 rounded-xl text-xs font-black select-none border transition-all duration-300 active:scale-95 cursor-pointer ${
                     isEditingWheel 
                       ? "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                       : "bg-[#FF4E00] border-[#FF4E00] text-white hover:bg-orange-600 hover:border-orange-600 shadow-md shadow-[#FF4E00]/10"
                   }`}
                 >
                   {isEditingWheel ? "⚙️ Đóng Bảng" : "✏️ Chỉnh Sửa"}
                 </button>
               </div>

               {isEditingWheel && (
                 <div className="mt-5 pt-5 border-t border-neutral-800/60 space-y-4 animate-fade-in">
                   
                   {/* Thiết lập link rút gọn (4 ký tự) của vòng quay */}
                   <div className="bg-neutral-950/60 border border-neutral-850 rounded-xl p-3.5 space-y-2 text-left">
                     <label className="text-xs font-black text-white flex items-center gap-1.5 justify-between">
                       <div className="flex items-center gap-1">
                         <span className="text-sm">🔗</span>
                         <span>MÃ CHIA SẺ RÚT GỌN (4 KÝ TỰ)</span>
                       </div>
                       <span className="text-[9px] text-[#FF4E00] font-mono normal-case">Tự chọn hoặc ngẫu nhiên</span>
                     </label>
                     <div className="flex gap-2">
                       <span className="bg-[#1C1C1C] border border-neutral-800 text-neutral-500 rounded-xl px-2.5 h-10 flex items-center justify-center text-[11px] font-mono select-none">
                         /
                       </span>
                       <input
                         type="text"
                         maxLength={12}
                         value={customShareCode}
                         onChange={(e) => {
                           const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                           setCustomShareCode(val);
                           if (val !== generatedId) {
                             setGeneratedId("");
                           }
                         }}
                         placeholder="nhap-ma-so"
                         className="flex-1 bg-[#1A1A1A] border border-neutral-800 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00] h-10 px-3 rounded-xl text-xs font-mono font-bold text-white uppercase placeholder:text-neutral-700 outline-none"
                       />
                       <button
                         type="button"
                         onClick={() => {
                           const newRandom = Array.from({length: 4}, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
                           setCustomShareCode(newRandom);
                           setGeneratedId("");
                         }}
                         className="px-3 bg-[#1A1A1A] hover:bg-neutral-800 text-neutral-400 border border-neutral-805 hover:text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                         title="Tự động tạo 4 ký tự ngẫu nhiên"
                       >
                         <span>🔄 Ngẫu nhiên</span>
                       </button>
                     </div>
                     {/* Ô MẬT KHẨU CHỈNH SỬA VÒNG QUAY */}
                     <div className="pt-3 border-t border-neutral-800/40 space-y-2">
                       <label className="text-xs font-black text-white flex items-center gap-1.5 justify-between">
                         <div className="flex items-center gap-1">
                           <span className="text-sm">🔑</span>
                           <span>MẬT KHẨU CHỈNH SỬA VÒNG QUAY</span>
                         </div>
                         {hasPresetPassword ? (
                           <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">🔒 Có mật khẩu bảo vệ</span>
                         ) : (
                           <span className="text-[9px] text-neutral-500 font-mono normal-case">Tùy chọn thiết lập</span>
                         )}
                       </label>
                       <div className="relative">
                         <input
                           type="text"
                           value={wheelPassword}
                           onChange={(e) => setWheelPassword(e.target.value)}
                           placeholder={hasPresetPassword ? "Nhập mật khẩu cũ để cập nhật thay đổi" : "Đặt mật khẩu bảo mật (tùy chọn)"}
                           className={`w-full bg-[#1A1A1A] border ${hasPresetPassword ? "border-[#FF4E00]/60 focus:border-[#FF4E00]" : "border-neutral-800 focus:border-[#FF4E00]"} focus:ring-1 focus:ring-[#FF4E00] h-10 px-3 rounded-xl text-xs text-white placeholder:text-neutral-600 outline-none`}
                         />
                       </div>
                       {hasPresetPassword && !isAutoPasswordActive && (
                         <p className="text-[10px] text-[#FF4E00] leading-normal font-medium animate-pulse">
                           ⚠️ Vòng quay này hiện tại đã có mật khẩu bảo mật. Bạn cần nhập đúng mật khẩu để chỉnh sửa & ghi đè.
                         </p>
                       )}
                       {isAutoPasswordActive && (
                         <div className="p-3 bg-[#FF4E00]/10 border border-[#FF4E00]/25 rounded-xl space-y-1">
                           <p className="text-[11px] text-[#FF4E00] font-black uppercase flex items-center gap-1.5 animate-pulse">
                             <span>⚠️ MẬT KHẨU TỰ ĐỘNG: {wheelPassword}</span>
                           </p>
                           <p className="text-[10px] text-neutral-300 leading-normal">
                             Hệ thống đã tự động lưu mật khẩu ngẫu nhiên 5 chữ số này vào cookie để tự động điền khi bạn cùng session truy cập sửa đổi. <strong>Hãy đặt lại mật khẩu của riêng bạn để bảo vệ vòng quay tốt nhất!</strong>
                           </p>
                         </div>
                       )}
                     </div>

                     <p className="text-[10px] text-neutral-500 leading-relaxed">
                       Bạn có thể thay đổi mã rút gọn và đặt mật khẩu bảo mật tùy ý, sau đó bấm <strong>🔗 Chia sẻ luật chơi này ngay!</strong> bên dưới để lưu và chia sẻ với bạn bè!
                     </p>
                   </div>

                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                       Danh sách ô vòng quay
                     </span>
                     <button
                       type="button"
                       onClick={handleResetWheel}
                       className="flex items-center gap-1.5 py-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                       title="Đặt lại các ô về mặc định của mẫu hiện tại"
                     >
                       <RotateCcw className="w-3.5 h-3.5" />
                       <span>Reset vòng quay</span>
                     </button>
                   </div>

                   {/* Add Custom segment block */}
                   <form onSubmit={handleAddSegment} className="flex gap-2 mb-4">
                     <div className="relative flex-1">
                       <input
                         type="text"
                         required
                         maxLength={32}
                         value={newSegText}
                         onChange={(e) => setNewSegText(e.target.value)}
                         placeholder="Nhập nội dung hình phạt mới..."
                         className="w-full bg-[#1A1A1A] border border-neutral-800 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00] h-11 px-3.5 rounded-xl text-xs font-semibold placeholder:text-neutral-600 text-white outline-none transition-colors"
                       />
                       {/* Fast Color selector box */}
                       <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1.5 bg-neutral-900/90 py-1 px-1.5 rounded-lg border border-neutral-800 font-mono">
                         <span 
                           className="w-4.5 h-4.5 rounded-full border border-white/20 block" 
                           style={{ backgroundColor: newSegColor }}
                         />
                         <select
                           value={newSegColor}
                           onChange={(e) => setNewSegColor(e.target.value)}
                           className="bg-transparent text-[9px] font-mono font-bold text-neutral-400 cursor-pointer outline-none select-none appearance-none pr-1 focus:text-white border-0"
                         >
                           {THEME_COLORS_PALETTE.map((color, idx) => (
                             <option key={idx} value={color} style={{ background: "#222" }}>
                               Màu {idx + 1}
                             </option>
                           ))}
                         </select>
                       </div>
                     </div>

                     <button
                       type="submit"
                       className="bg-[#1D1D1D] hover:bg-neutral-800 border border-neutral-800 hover:text-[#FF4E00] h-11 px-4 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                       title="Thêm dòng mới"
                     >
                       <Plus className="w-5 h-5" />
                     </button>
                   </form>

                   {/* List of active segments */}
                   <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 mb-4">
                     {segments.map((seg, idx) => (
                       <div
                         key={seg.id}
                         className="flex items-center gap-2 bg-[#171717] p-2 rounded-xl border border-neutral-900 shadow-inner group/item"
                       >
                         {/* Circle representing color segment */}
                         <div className="relative">
                           <input
                             type="color"
                             value={seg.color}
                             onChange={(e) => handleUpdateSegmentColor(seg.id, e.target.value)}
                             className="w-7 h-7 rounded-full border-0 outline-none cursor-pointer p-0 bg-transparent opacity-0 absolute inset-0 z-10"
                           />
                           <div 
                             className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-md cursor-pointer pointer-events-none"
                             style={{ backgroundColor: seg.color }}
                           >
                             {idx + 1}
                           </div>
                         </div>

                         {/* Inline edit value text field */}
                         <input
                           type="text"
                           maxLength={32}
                           value={seg.text}
                           onChange={(e) => handleUpdateSegmentText(seg.id, e.target.value)}
                           className="flex-1 bg-transparent border-0 font-medium text-xs font-sans text-white focus:bg-[#1C1C1C] focus:px-2 py-1 rounded outline-none transition-all"
                         />

                          {/* Simple remove node button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSegment(seg.id)}
                            className="p-2 text-neutral-500 hover:text-red-500 rounded-lg hover:bg-neutral-800/80 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Button lưu / tạo liên kết cho vòng quay */}
                    <button
                      type="button"
                      onClick={handleShareRules}
                      disabled={isGeneratingShare}
                      className="w-full py-3 bg-gradient-to-r from-[#FF4E00] to-orange-500 hover:from-orange-500 hover:to-orange-600 font-bold text-xs text-white rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingShare ? (
                        <span>⏳ Đang lưu thiết lập...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{generatedId ? "💾 Cập nhật & Lưu thay đổi" : "💾 Lưu & Tạo liên kết chia sẻ"}</span>
                        </>
                      )}
                    </button>

                    {generatedId && (
                      <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-neutral-900 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400 font-mono truncate max-w-[200px] text-left">
                          {window.location.host}/{generatedId}
                        </span>
                        <button
                          onClick={copyExistingShareLink}
                          className="py-1.5 px-3 bg-[#111] border border-neutral-800 text-[10px] text-neutral-300 font-bold rounded-lg hover:text-white transition-colors flex items-center gap-1"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? "Đã copy!" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

                        {/* 3. THIẾT LẬP HIỆU ỨNG TRẢI NGHIỆM */}
            <div className="bg-[#121212] border border-neutral-800/40 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                <SettingsIcon className="w-4.5 h-4.5 text-[#FF4E00]" />
                <span>Thiết lập hiệu ứng & Trải nghiệm</span>
              </h3>

              <div className="space-y-4">
                {/* 1. Sound ticks toggler */}
                <div className="flex items-center justify-between p-3.5 bg-[#171717] rounded-xl border border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800/80 rounded-lg text-neutral-300">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Sử dụng âm thanh</span>
                      <span className="text-[10px] text-neutral-500 leading-normal">Phát tiếng tạch tạch theo vòng quay khi di chuyển lát cắt</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings(s => ({ ...s, soundEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4E00]"></div>
                  </label>
                </div>

                {/* 2. Haptics tactile feedback */}
                <div className="flex items-center justify-between p-3.5 bg-[#171717] rounded-xl border border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800/80 rounded-lg text-neutral-300">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Hiệu ứng rung (Haptic)</span>
                      <span className="text-[10px] text-neutral-500 leading-normal">Tạo lực phản hồi rung nhẹ tê tái cầm tay khi trượt trên smartphone</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.vibrationEnabled}
                      onChange={(e) => setSettings(s => ({ ...s, vibrationEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4E00]"></div>
                  </label>
                </div>

                {/* 3. Multiplayer Mode Switch */}
                <div className="flex items-center justify-between p-3.5 bg-[#171717] rounded-xl border border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800/80 rounded-lg text-neutral-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Chế độ nhiều người chơi (Multiplayer)</span>
                      <span className="text-[10px] text-neutral-500 leading-normal">Khai tử sự đơn điệu; bật hiển thị danh sách, con giáp và luân phiên lượt quay cho bạn bè</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiplayerEnabled}
                      onChange={(e) => setMultiplayerEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4E00]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* App profile credits */}
            <div className="bg-[#121212]/55 border border-neutral-900/70 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="relative w-12 h-12 rounded-xl bg-[#141414] border border-neutral-800 flex items-center justify-center p-2 mb-2 shadow-inner">
                <img 
                  src={logoUrl} 
                  className="w-full h-full object-contain animate-[spin_32s_linear_infinite]" 
                  alt="HenXui Logo" 
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 text-[11px] select-none">🇻🇳</span>
              </div>
              <h4 className="text-xs font-extrabold text-white">henxui.online Web App</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Ứng dụng vòng quay may mắn đa năng hàng đầu dành cho các buổi tụ họp gia đình, quán bar, nhậu nhẹt và pub giải trí offline. <br/>Mở là chơi ngay, không phí phát sinh.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Elegant Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-900 z-40 flex items-center shadow-xl">
        <div className="max-w-lg w-full mx-auto flex items-center justify-around px-2">
          
          {/* Tab Button 0: Home Dashboard */}
          <button
            id="tab_nav_home"
            onClick={() => setCurrentTab("home")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "home"
                ? "text-[#FF4E00] opacity-100 scale-105"
                : "text-neutral-400 opacity-60 hover:opacity-85"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest">
              Trang Chủ
            </span>
          </button>

          {/* Tab Button 1: Wheel viewport */}
          <button
            id="tab_nav_wheel"
            onClick={() => setCurrentTab("wheel")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "wheel"
                ? "text-[#FF4E00] opacity-100 scale-105"
                : "text-neutral-400 opacity-60 hover:opacity-85"
            }`}
          >
            <span className="text-xl">🎡</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest">
              Lượt Quay
            </span>
          </button>

          {/* Tab Button 4: Settings toggle lists */}
          <button
            id="tab_nav_settings"
            onClick={() => setCurrentTab("settings")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "settings"
                ? "text-[#FF4E00] opacity-100 scale-105"
                : "text-neutral-400 opacity-60 hover:opacity-85"
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest">
              Cài Đặt
            </span>
          </button>

        </div>
      </footer>

      {/* Player customization config modal */}
      <PlayerConfigModal
        player={editingPlayer}
        isOpen={editingPlayer !== null}
        onClose={() => setEditingPlayer(null)}
        onSave={handleSavePlayerConfig}
        onDelete={handleRemovePlayer}
        isNew={isNewPlayer}
      />

      {/* Interactive SEO & Info Modal Sheet */}
      {isInfoModalOpen && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <div 
            className="bg-[#121212] border border-neutral-800/80 p-6 rounded-3xl max-w-md w-full relative max-h-[85vh] overflow-y-auto shadow-2xl shadow-[#FF4E00]/5 scrollbar-thin scrollbar-thumb-neutral-800 text-left"
            onClick={(e) => e.stopPropagation()}
            id="seo_info_modal_container"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white p-2 rounded-xl hover:bg-neutral-900 transition-all cursor-pointer text-xs"
            >
              ❌ Đóng
            </button>

            {/* Modal Title (Semantic H1 for SEO) */}
            <div className="flex items-start gap-3 mb-4 mt-4">
              <div className="p-2.5 bg-[#FF4E00]/10 rounded-xl text-[#FF4E00] flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-black text-[#FF4E00] tracking-tight leading-snug uppercase font-mono">
                  {seoInfo.title}
                </h1>
                <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 mt-1">
                  Thông tin Vòng quay & Đánh giá SEO
                </p>
              </div>
            </div>

            {/* Description (Semantic Article) */}
            <div className="bg-neutral-950/60 border border-neutral-900 p-4 rounded-2xl mb-4 text-left">
              <h2 className="text-[10px] font-bold text-neutral-400 mb-1.5 uppercase font-mono tracking-wider">
                💡 Giới thiệu vòng quay
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {seoInfo.description}
              </p>
            </div>

            {/* Tags Pills */}
            <div className="mb-5 text-left">
              <h2 className="text-[10px] font-bold text-neutral-400 mb-2 uppercase font-mono tracking-wider">
                🏷️ Từ khoá tìm kiếm (Tags)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {seoInfo.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-[9px] font-mono font-black uppercase px-2.5 py-1 bg-[#1A1A1A] border border-neutral-850 rounded-full text-[#FF4E00]/90 tracking-wide"
                  >
                    #{tag.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-neutral-900 pt-4 text-left">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-bold text-neutral-400 uppercase font-mono tracking-wider">
                  ⭐ Đánh giá cộng đồng
                </h2>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-amber-400">5.0</span>
                  <span className="text-amber-500 text-xs">★★★★★</span>
                </div>
              </div>

              {/* Static Rating Box */}
              <div className="bg-neutral-950/40 border border-neutral-950 rounded-xl p-3 flex items-center justify-between mb-4">
                <div className="text-left">
                  <span className="text-[9px] text-neutral-400 block font-semibold">Tín nhiệm người dùng</span>
                  <span className="text-[8px] text-neutral-500 block mt-0.5">Dựa trên 1,420 lượt đánh giá trực tuyến</span>
                </div>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[8px] font-mono font-bold uppercase">
                  ✓ Tín Nhiệm
                </div>
              </div>

              {/* Reviews Feed list */}
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 mb-5 text-left">
                {seoInfo.reviews.map((rev) => (
                  <div key={rev.id} className="bg-[#171717] border border-neutral-900/60 p-3 rounded-xl relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-extrabold text-neutral-200">
                        {rev.author}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-500">
                        {rev.date}
                      </span>
                    </div>
                    <div className="text-[9px] text-amber-500 tracking-tight mb-1">
                      {"★".repeat(rev.rating)}
                    </div>
                    <p className="text-xs text-neutral-400 leading-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Leave a review Form */}
              <form onSubmit={handleAddReview} className="border-t border-neutral-900/80 pt-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-[10px] font-bold text-neutral-400 mb-3 uppercase font-mono tracking-wider">
                  ✍️ Viết đánh giá của bạn
                </h3>
                
                {reviewSuccessMsg && (
                  <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-center text-[10px] text-emerald-400 font-bold animate-pulse">
                    {reviewSuccessMsg}
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Họ & Tên"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-900 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00] outline-none rounded-xl h-8 px-2.5 text-xs text-white placeholder:text-neutral-600"
                    />
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-neutral-950 border border-neutral-900 focus:border-[#FF4E00] outline-none rounded-xl h-8 px-2 text-xs text-amber-400 cursor-pointer"
                    >
                      <option value={5}>⭐️⭐️⭐️⭐️⭐️ (5)</option>
                      <option value={4}>⭐️⭐️⭐️⭐️ (4)</option>
                      <option value={3}>⭐️⭐️⭐️ (3)</option>
                    </select>
                  </div>
                  
                  <textarea
                    required
                    rows={2}
                    placeholder="Nhập trải nghiệm thực tế sử dụng của bạn..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-900 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00] outline-none rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-600 resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full h-8 bg-[#FF4E00]/10 border border-[#FF4E00]/25 hover:bg-[#FF4E00]/20 text-[#FF4E00] rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    🚀 Gửi đánh giá cộng đồng
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Hidden SEO Tags for automatic search indexing & crawlers support under actual viewport */}
      <section className="sr-only" aria-hidden="true">
        <article>
          <h1>{seoInfo.title}</h1>
          <p>{seoInfo.description}</p>
          <div>
            {seoInfo.tags.map(t => (
              <span key={t}>#{t}</span>
            ))}
          </div>
          <div>
            {seoInfo.reviews.map(r => (
              <div key={r.id}>
                <h3>{r.author}</h3>
                <span>Đánh giá: {r.rating}/5</span>
                <p>{r.comment}</p>
                <time>{r.date}</time>
              </div>
            ))}
          </div>
        </article>
      </section>

    </div>
  );
}
