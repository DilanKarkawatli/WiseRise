import { ElevenLabsClient } from "elevenlabs";
import outputVoiceID from "./outputVoiceID.js";


// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY
});

export async function generateSpeech(text, voiceKey) {
	console.log("Generating speech with voiceKey:", voiceKey);

	const voiceID = outputVoiceID(voiceKey || "daniel"); // voiceKey or "daniel"

	const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream`, {
			method: 'POST',
			headers: {
				"xi-api-key": process.env.ELEVENLABS_API_KEY,
				"Accept": "audio/mpeg",
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model_id: 'eleven_multilingual_v2',
				Accept: 'audio/mpeg',
				voice_settings: {
					stability: 0.8,
					similarity_boost: 0.75,
					style: 0.8,
					use_speaker_boost: false,
				},
				text: text,
			}),
		});

	const contentType = response.headers.get("content-type");
	console.log("Content-Type:", contentType);

	// /*
	// Buffer is a Node.js class that represents binary data. 
	// We can use it to store the audio data returned by the ElevenLabs API.
	// */

	return Buffer.from(await response.arrayBuffer());
}