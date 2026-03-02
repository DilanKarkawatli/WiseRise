import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const voice_ids = {
	"Spuds Oxley": "NOpBlnGInO9m6vDvFkFC",
	"Wyatt": "YXpFCvM1S3JbWEJhoskW",
	"Myrrdin": "oR4uRy4fHDUGGISL0Rev",
	"Austin": "Bj9UqZbhQsanLzgalpEG",
	"Miranda": "SpujdQyiKXTCe05mAnq6",
	"Franco": "CWdvtq55Epb6LRR5D3mM",
}

if (!OPENAI_API_KEY) {
	throw new Error("Missing API KEY");
}

if (!ELEVENLABS_API_KEY) {
	throw new Error("Missing API KEY");
}

const projectRoot = process.cwd();

const outputPaths = [
	path.join(projectRoot, 'assets', 'sounds', 'voice1.mp3'),
	path.join(projectRoot, 'assets', 'sounds', 'voice2.mp3'),
	path.join(projectRoot, 'assets', 'sounds', 'voice3.mp3'),
	path.join(projectRoot, 'assets', 'sounds', 'voice4.mp3'),
	path.join(projectRoot, 'assets', 'sounds', 'voice5.mp3'),
	path.join(projectRoot, 'assets', 'sounds', 'voice6.mp3'),
];

async function generatePersonalizedText(prompt) {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENAI_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'gpt-4.1-mini',
			messages: [
				{
					role: 'user',
					content: prompt,
				}
			]
		}),
	});
	
	const json = await response.json();

	// console.log("API RESPONSE: ", JSON.stringify(json, null, 2));

	if (!response.ok) {
		throw new Error(json.error?.message || "Text generation failed");
	}
	
	if (!json.choices?.[0]?.message?.content) {
		throw new Error("Invalid AI response format");
	}

	return json.choices[0].message.content.trim();
}

async function generateSpeech(text, filePath, voice_id) {
	// OPENAI TTS API
	// const response = await fetch('https://api.openai.com/v1/audio/speech', {
	// 	method: 'POST',
	// 	headers: {
	// 		Authorization: `Bearer ${OPENAI_API_KEY}`,
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify({
	// 		model: 'gpt-4o-mini-tts',
	// 		voice: 'ash', // You can choose different voices if supported by the API
	// 		format: 'mp3',
	// 		input: text,
	// 		pitch: -5,
	// 	}),
	// });

	// ELEVENLABS TTS API
	const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`, {
		method: 'POST',
		headers: {
			"xi-api-key": ELEVENLABS_API_KEY,
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

	if (!response.ok) {
		 const errText = await response.text();
		 console.error("TTS API Error Response: ", errText);
		throw new Error(`TTS request failed (${response.status})`);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(filePath, buffer);

}


async function main() {	
	const testPrompt = await generatePersonalizedText("Generate text to introduce yourself as a new mentor. Under 25 words.");
	for (let i=0; i < outputPaths.length; i++) {
		await generateSpeech(testPrompt, outputPaths[i], voice_ids[Object.keys(voice_ids)[i]]);
		console.log("Voice ID: ", Object.keys(voice_ids)[i]);
	}	
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
