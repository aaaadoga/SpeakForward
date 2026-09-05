import { IDENTITY_DISCLAIMER_TEXT } from "@/lib/personas";

// §2.3: 醒目且不可跳过的身份免责声明 —— 信任判断权下放给社区/捐赠者
export function DisclaimerBanner() {
  return (
    <div
      role="note"
      className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800"
    >
      ⚠️ {IDENTITY_DISCLAIMER_TEXT}
    </div>
  );
}
