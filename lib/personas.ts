// §2.4: 3-5 个预设人格，MVP 不做声音克隆
// voice_id 对应用户在 ElevenLabs 自建的音色（免费层禁止 API 调用预置音色）
export type PersonaId = "advocate" | "storyteller" | "mobilizer";

export interface Persona {
  id: PersonaId;
  name: string;
  description: string;
  voiceId: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "advocate",
    name: "沉稳倡导者",
    description: "低沉、沉稳、克制，有信念感",
    voiceId: "Fl6SiqWjBJzoqMQHWHaa",
  },
  {
    id: "storyteller",
    name: "温暖讲述者",
    description: "温暖、亲和、柔和，讲述感",
    voiceId: "ayqrSRCRL1uGdlFUT9vC",
  },
  {
    id: "mobilizer",
    name: "有力动员者",
    description: "充沛、有号召力、节奏推进",
    voiceId: "lPNRbIjGmJDvdPYBRs9Q",
  },
];

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

// §2.4: 强制披露的可见标识文案
export const AI_DISCLOSURE_TEXT =
  "此内容由AI生成，用于健康原因导致的言语受限";

// §2.3: 身份免责声明（醒目且不可跳过）
export const IDENTITY_DISCLAIMER_TEXT =
  "本平台不验证身份，请您自行判断。";

// §2.1: 文本长度上限，保护免费层 1 万字符/月额度
export const MAX_VISION_CHARS = 1200;
