/**
 * Converts a standard emoji character into its high-fidelity Twemoji SVG CDN URL
 * to bypass rendering issues on older systems or specific browser contexts.
 */
export function getEmojiSvgUrl(emoji: string): string {
  try {
    if (!emoji || typeof emoji !== "string") return "";
    
    // Get all code points of the string
    const codePoints: string[] = [];
    for (const char of emoji) {
      const cp = char.codePointAt(0);
      if (cp) {
        codePoints.push(cp.toString(16));
      }
    }
    
    if (codePoints.length === 0) return "";
    const hex = codePoints.join("-");
    
    // Use the optimized and stable cdnjs Twemoji SVG archive
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${hex}.svg`;
  } catch (error) {
    console.error("Error generating Twemoji URL for", emoji, error);
    return "";
  }
}
