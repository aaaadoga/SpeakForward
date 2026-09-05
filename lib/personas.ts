// §2.4: 3-5 preset personas, no voice cloning in MVP
// voice_id points to user-created voices in ElevenLabs (free tier blocks API access to premade library voices)
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
    name: "The Steady Advocate",
    description: "Low, steady, restrained — a voice of conviction",
    voiceId: "Fl6SiqWjBJzoqMQHWHaa",
  },
  {
    id: "storyteller",
    name: "The Warm Storyteller",
    description: "Warm, gentle, intimate — a voice that narrates",
    voiceId: "ayqrSRCRL1uGdlFUT9vC",
  },
  {
    id: "mobilizer",
    name: "The Powerful Mobilizer",
    description: "Energetic, rallying, forward-driving",
    voiceId: "lPNRbIjGmJDvdPYBRs9Q",
  },
];

// §2.4: mandatory visible AI disclosure
export const AI_DISCLOSURE_TEXT =
  "This content is AI-generated, on behalf of a creator with a speech disability";

// §2.3: prominent, non-dismissable identity disclaimer
export const IDENTITY_DISCLAIMER_TEXT =
  "This platform does not verify identities. Please judge for yourself.";

// §2.1: text length cap to protect the free-tier 10k chars/month quota
export const MAX_VISION_CHARS = 1200;

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
