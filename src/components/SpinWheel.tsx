import React, { useEffect, useRef, useState } from "react";
import { Segment } from "../types";
import { playTickSound, playWinSound, triggerHapticVibe } from "../utils/audio";

interface SpinWheelProps {
  segments: Segment[];
  onSpinStart: () => void;
  onSpinEnd: (segment: Segment) => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export default function SpinWheel({
  segments,
  onSpinStart,
  onSpinEnd,
  soundEnabled,
  vibrationEnabled,
  isSpinning,
  setIsSpinning,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep track of parameters with refs to avoid re-binding requestAnimationFrame
  const segmentsRef = useRef<Segment[]>(segments);
  const soundRef = useRef(soundEnabled);
  const vibrationRef = useRef(vibrationEnabled);

  // Rotation physics variables
  const angleRef = useRef(0);
  const isSpinningRef = useRef(isSpinning);

  const [dimensions, setDimensions] = useState({ width: 320, height: 320 });

  // Blinking light indicator phase
  const bulbPhaseRef = useRef(0);

  // Update refs to ensure they are always fresh in drawing loop
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    vibrationRef.current = vibrationEnabled;
  }, [vibrationEnabled]);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  // Handle responsive canvas sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const containerWidth = containerRef.current?.getBoundingClientRect().width || 320;
      // Cap size to maintain clean proportion on large desktops
      const size = Math.min(containerWidth, 420);
      setDimensions({ width: size, height: size });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Primary requestAnimationFrame renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const draw = () => {
      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = width / 2 - 20; // margin for bulbs and border
      const numSegments = segmentsRef.current.length;

      if (numSegments === 0) return;

      const arcSize = (2 * Math.PI) / numSegments;
      const currentRotation = angleRef.current;

      // Draw shadow glow backdrop
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#0f172a"; // slate-900 background of physical wheel
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(239, 68, 68, 0.4)"; // warm red glow
      ctx.fill();
      ctx.restore();

      // Draw slices
      ctx.save();
      for (let i = 0; i < numSegments; i++) {
        const seg = segmentsRef.current[i];
        const startAngle = currentRotation + i * arcSize;
        const endAngle = startAngle + arcSize;

        // Draw colored slice
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.fillStyle = seg.color;
        ctx.fill();

        // Stroke border separating slice slice
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(15, 23, 42, 0.25)";
        ctx.stroke();

        // Draw text inside each slice
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + arcSize / 2);

        // Position text
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";

        // Size font responsively based on radius
        const fontSize = Math.max(11, Math.min(14, radius / 11));
        ctx.font = `bold ${fontSize}px "Inter", system-ui, sans-serif`;

        // Clip text if too long
        let text = seg.text;
        if (text.length > 20) {
          text = text.substring(0, 18) + "...";
        }

        // Draw shadow on text for maximum legibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 3;
        ctx.fillText(text, radius - 15, 0);

        ctx.restore();
      }
      ctx.restore();

      // Draw the neon outer rim border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 3, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#e2e8f0"; // light slate ring rim
      ctx.stroke();
      ctx.restore();

      // Outer gold glowing border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 7, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#f59e0b"; // golden border
      ctx.stroke();
      ctx.restore();

      // Blinking neon fairground dot lights
      bulbPhaseRef.current += 1;
      const numBulbs = 24;
      for (let b = 0; b < numBulbs; b++) {
        const bulbAngle = (b * (2 * Math.PI)) / numBulbs;
        const bx = cx + (radius + 5) * Math.cos(bulbAngle);
        const by = cy + (radius + 5) * Math.sin(bulbAngle);

        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, 2 * Math.PI);

        // Blinking logic alternating color phase
        const isActive = (Math.floor(bulbPhaseRef.current / 15) + b) % 2 === 0;
        ctx.fillStyle = isActive ? "#ff4500" : "#ffd700"; // orange-red or gold
        if (isActive) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = "#ff4500";
        } else {
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#ffd750";
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw a shiny metal central dome
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.24, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, radius * 0.24);
      gradient.addColorStop(0, "#f8fafc"); // shiny white reflex
      gradient.addColorStop(0.3, "#94a3b8");
      gradient.addColorStop(1, "#1e293b"); // dark steel blue-gray
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      // Draw selection pin arrow pointing down from TOP (Center Top point is (cx, cy - radius - 15))
      ctx.save();
      ctx.translate(cx, cy - radius - 5);
      // Red/Orange sleek arrow pointing downwards
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(-12, -18);
      ctx.lineTo(12, -18);
      ctx.lineTo(8, -2);
      ctx.lineTo(0, 10); // pointy tip touches slightly inside the wheel outer border
      ctx.lineTo(-8, -2);
      ctx.closePath();

      const arrowGrad = ctx.createLinearGradient(-12, -18, 12, 10);
      arrowGrad.addColorStop(0, "#ef4444"); // vibrant warm red
      arrowGrad.addColorStop(1, "#dc2626");
      ctx.fillStyle = arrowGrad;
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();

      // Frame looped callback
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dimensions]);

  // NEW: Holding/Power States with Game-like Accelerator Engine
  const [isHolding, setIsHolding] = useState(false);
  const [isOutside, setIsOutside] = useState(false);
  const [power, setPowerState] = useState(1.0);
  const powerRef = useRef(1.0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const thetaRef = useRef<number>(0);
  const speedRef = useRef<number>(6.0);
  const targetSpeedRef = useRef<number>(6.0);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  const setPower = (val: number) => {
    // Clamp between 0.3 (30%) and 1.5 (150%)
    const clamped = Math.max(0.3, Math.min(1.5, val));
    setPowerState(clamped);
    powerRef.current = clamped;
  };

  // Power charge oscillation loop
  const holdingLoopRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHolding) {
      let lastTime = Date.now();
      const tick = () => {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Drift current speed to target speed (smooth acceleration curves)
        speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.1;

        // Random target speed adjustments to mimic arcade game power oscillation
        if (Math.random() < 0.04) {
          // Accelerate or decelerate: from fast (16.0 Hz multiplier) to normal (4.0 Hz)
          targetSpeedRef.current = 4.0 + Math.random() * 12.0;
        }

        // Increment theta phase
        thetaRef.current += speedRef.current * dt;

        // Oscillate mapping: starting at theta = Math.asin(1/6) -> sin(theta)=1/6 -> 0.9 + 0.6*(1/6) = 1.0 (100%)
        // Max value: 0.9 + 0.6 * (1) = 1.5 (150%)
        // Min value: 0.9 + 0.6 * (-1) = 0.3 (30%)
        const currentPower = 0.9 + 0.6 * Math.sin(thetaRef.current);
        setPower(currentPower);

        holdingLoopRef.current = requestAnimationFrame(tick);
      };
      holdingLoopRef.current = requestAnimationFrame(tick);
    } else {
      if (holdingLoopRef.current) {
        cancelAnimationFrame(holdingLoopRef.current);
        holdingLoopRef.current = null;
      }
    }

    return () => {
      if (holdingLoopRef.current) {
        cancelAnimationFrame(holdingLoopRef.current);
      }
    };
  }, [isHolding]);

  // Unified release triggering code
  const triggerSpin = (appliedPower: number) => {
    if (isSpinning) return;

    setIsSpinning(true);
    onSpinStart();

    // After 600ms matching transition time, physically spin the wheel canvas
    setTimeout(() => {
      const startTime = Date.now();
      // Apply the power multiplier to standard speed base (22 to 34)
      const initialVelocity = (22 + Math.random() * 12) * appliedPower;
      let currentVelocity = initialVelocity;

      // Track sound tick milestones using segments
      let lastSegmentIndex = -1;

      const updatePhysics = () => {
        // Small constant friction slowing it down
        currentVelocity *= 0.985;
        angleRef.current += currentVelocity * 0.016; 

        // Calculate current segment pointing to:
        const numSegments = segmentsRef.current.length;
        if (numSegments > 0) {
          const arcSize = (2 * Math.PI) / numSegments;
          const positiveAngle = ((1.5 * Math.PI - angleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
          const currentSegIndex = Math.floor(positiveAngle / arcSize) % numSegments;

          // Sound tick & haptic feedback when segments flip
          if (currentSegIndex !== lastSegmentIndex) {
            if (soundRef.current) playTickSound();
            if (vibrationRef.current) triggerHapticVibe(20);
            lastSegmentIndex = currentSegIndex;
          }
        }

        if (currentVelocity < 0.15) {
          // Complete spin cycle
          setIsSpinning(false);
          const numSegs = segmentsRef.current.length;
          if (numSegs > 0) {
            const arcSize = (2 * Math.PI) / numSegs;
            const positiveAngle = ((1.5 * Math.PI - angleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const finalIndex = Math.floor(positiveAngle / arcSize) % numSegs;
            
            const winner = segmentsRef.current[finalIndex];
            if (soundRef.current) playWinSound();
            if (vibrationRef.current) triggerHapticVibe(160);
            
            onSpinEnd(winner);
          }
        } else {
          requestAnimationFrame(updatePhysics);
        }
      };

      requestAnimationFrame(updatePhysics);
    }, 600);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isSpinning || isHolding) return;

    // Prevent scrolling or contextual zoom on mobile devices while holding
    e.preventDefault();

    const currentBtn = e.currentTarget || buttonRef.current;
    activeBtnRef.current = currentBtn;

    setIsHolding(true);
    setIsOutside(false);
    
    // Core game arcade initial values: start directly at 100% (phi = Math.asin(1/6)) heading UPWARDS
    thetaRef.current = Math.asin(1/6);
    speedRef.current = 6.0;
    targetSpeedRef.current = 6.0;
    setPower(1.0);

    const checkIsInside = (clientX: number, clientY: number) => {
      const btn = activeBtnRef.current;
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      const padding = 20; // safe touch range target
      return (
        clientX >= rect.left - padding &&
        clientX <= rect.right + padding &&
        clientY >= rect.top - padding &&
        clientY <= rect.bottom + padding
      );
    };

    const handlePointerMoveGlobal = (moveEvent: PointerEvent) => {
      const inside = checkIsInside(moveEvent.clientX, moveEvent.clientY);
      setIsOutside(!inside);
    };

    const handlePointerUpGlobal = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMoveGlobal);
      window.removeEventListener("pointerup", handlePointerUpGlobal);

      const inside = checkIsInside(upEvent.clientX, upEvent.clientY);
      setIsHolding(false);
      activeBtnRef.current = null;

      if (inside) {
        triggerSpin(powerRef.current);
      } else {
        setIsOutside(false);
      }
    };

    window.addEventListener("pointermove", handlePointerMoveGlobal);
    window.addEventListener("pointerup", handlePointerUpGlobal, { once: true });
  };

  const powerPercent = Math.round(power * 100);
  
  const getPowerLevelLabel = (p: number) => {
    if (p < 0.6) return "Rất nhẹ 🍃";
    if (p < 0.9) return "Nhẹ nhàng 🎈";
    if (p < 1.2) return "Vừa đủ ⚡";
    if (p < 1.4) return "Mạnh mẽ 🔥";
    return "Cực đại 🚀";
  };

  const isHoldingInner = isHolding && activeBtnRef.current?.id === "spin_inner_button";
  const isHoldingBig = isHolding && activeBtnRef.current?.id === "big_spin_action_button";

  return (
    <div className="flex flex-col items-center justify-center p-3 w-full" ref={containerRef}>
      <div className="relative flex justify-center items-center w-full max-w-[420px] bg-slate-950/20 rounded-full border border-slate-500/10 p-3 shadow-inner">
        <canvas
          id="spinning_canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="max-w-full transition-shadow duration-300"
        />
        
        {/* Physical spin center button saying QUAY */}
        <button
          id="spin_inner_button"
          ref={buttonRef}
          onPointerDown={handlePointerDown}
          disabled={isSpinning}
          className={`absolute flex flex-col items-center justify-center rounded-full text-white font-bold select-none cursor-pointer border shadow-lg transition-all duration-300 active:scale-95 touch-none
            ${isSpinning 
              ? "bg-slate-700/60 border-slate-600/50 cursor-not-allowed scale-95 text-slate-400" 
              : isHoldingInner
                ? isOutside
                  ? "bg-amber-600 hover:bg-amber-700 border-amber-300 scale-105 shadow-amber-500/30"
                  : "bg-emerald-500 hover:bg-emerald-600 border-emerald-300 scale-110 shadow-emerald-500/50 animate-pulse"
                : "bg-radial from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 border-rose-300 shadow-rose-950/40 hover:shadow-rose-500/30 scale-100"
            }`}
          style={{
            width: dimensions.width * 0.28,
            height: dimensions.width * 0.28,
          }}
        >
          <span className="text-[10px] uppercase font-mono tracking-wide hidden sm:inline">⚡</span>
          <span className="text-xs font-black uppercase text-center leading-auto tracking-tight">
            {isSpinning 
              ? "QUAY..." 
              : isHoldingInner
                ? isOutside
                  ? "HỦY!"
                  : "THẢ!"
                : "GIỮ PIN"
            }
          </span>
          <span className="text-[7px] font-mono tracking-tighter opacity-80 mt-0.5 select-none text-white block">
            {isHoldingInner ? `${powerPercent}%` : "tích lực"}
          </span>
        </button>
      </div>

      {/* Primary BIG spin trigger on mobile page underneath as requested */}
      <div className="w-full max-w-sm mt-4 px-4">
        <button
          id="big_spin_action_button"
          onPointerDown={handlePointerDown}
          disabled={isSpinning}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl flex flex-col items-center justify-center gap-1 select-none transform transition-all duration-200 active:scale-98 touch-none
            ${isSpinning
              ? "bg-slate-700 border-b-0 text-slate-400 cursor-not-allowed"
              : isHoldingBig
                ? isOutside
                  ? "bg-amber-600 border-[#FF8C00] text-white shadow-amber-500/20 scale-102"
                  : "bg-emerald-500 border-emerald-300 border-b-2 text-white shadow-emerald-500/30 scale-105 animate-pulse"
                : "bg-red-500 hover:bg-red-600 border-b-6 border-red-700 active:border-b-0 text-white shadow-red-500/25"
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="uppercase tracking-wide font-black">
              {isSpinning 
                ? "ĐANG XOAY VÒNG QUAY..." 
                : isHoldingBig
                  ? isOutside
                    ? "HỦY QUAY (THẢ RA NGOÀI)"
                    : `THẢ RA ĐỂ QUAY (${powerPercent}%)`
                  : "CHẠM GIỮ ĐỂ TÍCH LỰC!"
              }
            </span>
          </div>
          {isHoldingBig && !isOutside && (
            <span className="text-[10px] font-mono opacity-80 animate-bounce">
              Lực hiện tại: {getPowerLevelLabel(power)}
            </span>
          )}
        </button>
      </div>

      {/* Tips & Hướng dẫn xoay vòng quay */}
      <div className="w-full max-w-sm mt-5 px-4 text-left">
        <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center gap-1.5 mb-2.5 text-orange-400">
            <span className="text-sm">💡</span>
            <span className="text-xs font-black uppercase tracking-wider font-mono">Tips & Hướng dẫn quay</span>
          </div>
          <ul className="space-y-2 text-[11px] text-neutral-400 font-medium leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-orange-500 mt-0.5">•</span>
              <span><strong>Tích hỏa lực:</strong> Nhấn giữ nút đỏ trung tâm hoặc nút <strong>CHẠM GIỮ</strong> to phía trên để tích tụ hỏa lực từ 30% đến 150%.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-orange-500 mt-0.5">•</span>
              <span><strong>Tốc độ bùng nổ:</strong> Lực quay tích càng mạnh, vòng quay xoay càng lâu và tốc độ quay càng tít tắp kịch tính!</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-orange-500 mt-0.5">•</span>
              <span><strong>Cách hủy lượt:</strong> Khi đang giữ nút tích lực, dải ngón tay ra ngoài vùng nút rồi mới thả ra để hủy lượt quay dễ khôi phục.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
