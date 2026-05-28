import React, { useState, useEffect } from "react";
import { getEmojiSvgUrl } from "../utils/emoji";

interface EmojiAvatarProps {
  emoji: string;
  className?: string; // custom tailoring styles
}

export default function EmojiAvatar({ emoji, className = "" }: EmojiAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    setHasError(false);
    if (emoji) {
      setImgUrl(getEmojiSvgUrl(emoji));
    }
  }, [emoji]);

  if (!emoji) return null;

  // Fallback to text if there was a load error or no URL generated
  if (hasError || !imgUrl) {
    return (
      <span className={`select-none leading-none inline-block emoji-font ${className}`}>
        {emoji}
      </span>
    );
  }

  // Auto-detect if caller defined explicit width/height classes to prevent layout breaking
  const hasWidth = className.includes("w-") || className.includes("max-w-");
  const hasHeight = className.includes("h-") || className.includes("max-h-");
  const defaultSizeClasses = `${hasWidth ? "" : "w-[1.1em] shrink-0"} ${hasHeight ? "" : "h-[1.1em] shrink-0"} max-w-full max-h-full inline-block align-middle object-contain aspect-square`;

  return (
    <img
      src={imgUrl}
      alt={emoji}
      className={`select-none pointer-events-none transition-all duration-300 ${defaultSizeClasses} ${className}`}
      referrerPolicy="no-referrer"
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
