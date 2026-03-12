/*
Based on user input, outputs the correct voice id
*/
const VOICE_CATALOG = {
  daniel: { key: "daniel", label: "Wisdom Purveyor", providerVoiceId: "onwK4e9ZLuTAKqWW03F9" },
  adam: { key: "adam", label: "Socratic Monologue", providerVoiceId: "pNInz6obpgDQGcFmaJgB" },
  wyatt: { key: "wyatt", label: "Aurelian Meditations", providerVoiceId: "YXpFCvM1S3JbWEJhoskW" },
  myrrdin: { key: "myrrdin", label: "Calm Narrator", providerVoiceId: "oR4uRy4fHDUGGISL0Rev" },
  spuds_oxley: { key: "spuds_oxley", label: "Wise Mother", providerVoiceId: "NOpBlnGInO9m6vDvFkFC" },
};

export function listVoices() {
	return Object.values(VOICE_CATALOG).map(({ key, label }) => ({ key, label }));
}

export function isValidVoiceKey(voiceKey) {
	return Boolean(voiceKey && VOICE_CATALOG[voiceKey.toLowerCase()]);
}

export default function outputVoiceID(voiceKey) {
  const key = (voiceKey || "daniel").toLowerCase();
  console.log(`Outputting voice ID for key: ${key}`);
  return VOICE_CATALOG[key]?.providerVoiceId ?? VOICE_CATALOG.daniel.providerVoiceId;
}