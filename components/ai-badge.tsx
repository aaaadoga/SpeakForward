import { AI_DISCLOSURE_TEXT } from "@/lib/personas";
import { Badge } from "@/components/ui/badge";

// §2.4: 所有生成的音频必须展示可见 AI 标识 —— 核心产品特性，不可妥协（§7.4）
export function AIBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={
        "border-purple-400/60 bg-purple-50 text-purple-700 " + (className ?? "")
      }
      aria-label={AI_DISCLOSURE_TEXT}
    >
      ✦ {AI_DISCLOSURE_TEXT}
    </Badge>
  );
}
