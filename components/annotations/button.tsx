"use client";

// 图标
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <button
      className="hover:bg-gray-400/20 p-1 rounded ml-auto text-zinc-400"
      aria-label="Copy to clipboard"
      onClick={copyToClipboard}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}
