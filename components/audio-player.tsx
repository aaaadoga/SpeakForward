"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ai-badge";

// §5 降级预案：ElevenLabs 失败/限流 → 回退浏览器 Web Speech API，
// UI 显示"临时语音引擎"标识。此逻辑仅在无音频文件时启用。
export function AudioPlayer({
  audioUrl,
  visionText,
}: {
  audioUrl: string | null;
  visionText: string;
}) {
  const [fallbackActive, setFallbackActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 音频加载失败时自动降级
  const onAudioError = () => setFallbackActive(true);

  const stopFallback = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const startFallback = () => {
    const utter = new SpeechSynthesisUtterance(visionText);
    utter.lang = "zh-CN";
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (audioUrl && !fallbackActive) {
    return (
      <div className="space-y-3">
        <AIBadge />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- 语音为整段合成朗读，原文全文展示于下方，等同字幕功能 */}
        <audio
          controls
          src={audioUrl}
          className="w-full"
          preload="metadata"
          onError={onAudioError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          ⚡ 临时语音引擎（浏览器合成）
        </span>
        <AIBadge />
      </div>
      {speaking ? (
        <Button variant="outline" onClick={stopFallback}>
          ⏹ 停止朗读
        </Button>
      ) : (
        <Button onClick={startFallback}>▶ 播放（临时语音引擎）</Button>
      )}
    </div>
  );
}
