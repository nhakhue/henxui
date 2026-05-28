/**
 * Zero-loading pure HTML5 Web Audio API Synthesizer
 * Bypasses browser autoplay restrictions using lazy-init, providing high performance ticking and win signals.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a custom synthesizer "Tick" sound (clicking gear effect as segments spin by)
 */
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // Quick high frequency click
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (error) {
    // Graceful fallback for browsers with web audio issues
    console.warn("Web Audio failure:", error);
  }
}

/**
 * Play a "Winning Alert" musical chime (multiple ascending sine waves)
 */
export function playWinSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playTone = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.12, now + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    // Fast arpeggio for a winning, celebratory feel
    playTone(523.25, 0.0, 0.4);   // C5
    playTone(659.25, 0.1, 0.4);   // E5
    playTone(783.99, 0.2, 0.4);   // G5
    playTone(1046.50, 0.3, 0.8);  // C6
  } catch (error) {
    console.warn("Web Audio failure:", error);
  }
}

/**
 * Trigger device vibration (very satisfying on smartphones!)
 */
export function triggerHapticVibe(duration: number = 30) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Ignore vibration blocks
    }
  }
}
