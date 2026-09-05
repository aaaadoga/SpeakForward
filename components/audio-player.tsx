"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ai-badge";

// §5 degradation path: ElevenLabs failure/rate-limit → fall back to browser
// Web Speech API with a visible "temporary voice engine" label.
export function AudioPlayer({
  audioUrl,
  visionText,
}: {
  audioUrl: string | null;
  visionText: string;
}) {
  const [fallbackActive, setFallbackActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);

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
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- full transcript shown below */}
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          ⚡ Temporary voice engine (browser synthesis)
        </span>
        <AIBadge />
      </div>
      {speaking ? (
        <Button variant="outline" onClick={stopFallback}>
          ⏹ Stop
        </Button>
      ) : (
        <Button onClick={startFallback}>▶ Play (temporary voice engine)</Button>
      )}
    </div>
  );
}
