import 'dotenv/config';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildPrompt } from './promptBuilder.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const voice_ids = {
	"Daniel": "onwK4e9ZLuTAKqWW03F9",
	"Adam": "pNInz6obpgDQGcFmaJgB",
	"Wyatt": "YXpFCvM1S3JbWEJhoskW",
	"Myrrdin": "oR4uRy4fHDUGGISL0Rev",
	"Spuds Oxley": "NOpBlnGInO9m6vDvFkFC",
}

if (!OPENAI_API_KEY) {
	throw new Error("Missing API KEY");
}

if (!ELEVENLABS_API_KEY) {
	throw new Error("Missing API KEY");
}


const projectRoot = process.cwd();

const outputPath = path.join(
	projectRoot, 
	'android', 
	'app', 
	'src', 
	'main', 
	'res', 
	'raw', 
	'alarm_voice.mp3'
);

const tempDir = path.join(projectRoot, 'temp_audio');

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

async function generateSpeech(text, filePath) {
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
	const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_ids["Daniel"]}/stream`, {
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

	const contentType = response.headers.get("content-type");
	console.log("Content-Type:", contentType);

	if (!response.ok) {
		 const errText = await response.text();
		 console.error("TTS API Error Response: ", errText);
		throw new Error(`TTS request failed (${response.status})`);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(filePath, buffer);

}

function cleanText(text) {
  return text
    .replace(/[*_]/g, "")          // remove markdown
    .replace(/[“”]/g, '"')         // normalize quotes
    .replace(/\n+/g, " ")          // remove line breaks
    .replace(/\s+/g, " ")          // normalize spaces
    .trim();
}

function splitIntoSentences(text) {
	// Simple sentence splitter based on punctuation.
	return text
		.match(/[^.!?]+[.!?]+/g) || [text]; // keeps sentences intact
}

async function main() {
	await fs.mkdir(tempDir, { recursive: true });

	const prompt = await buildPrompt();
	console.log("Generated Prompt: \n", prompt);

	const fullText = await generatePersonalizedText(prompt);
	console.log("Full AI Text: ", fullText);

	const cleanedFullText = cleanText(fullText);

	const sentences = splitIntoSentences(cleanedFullText);
	console.log("Split into sentences: ", sentences);

	//-----
	const audioFiles = [];

	for (let i = 0; i < sentences.length; i++) {
		const sentence = cleanText(sentences[i]);

		if (!sentence || sentence.length < 3) continue; // skip very short sentences

		const file = path.join(tempDir, `part_${i}.mp3`);
		console.log("TTS: ", sentence);

		await generateSpeech(sentence, file);

		audioFiles.push(file);
	}

	const silenceFile = path.join(tempDir, 'silence.mp3');

	execSync(
  	`ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 1 "${silenceFile}"`
	);

	let listContent = "";

	audioFiles.forEach((file, index) => {
		const safe = file.replace(/\\/g, "/");
		listContent += `file '${safe}'\n`;
		if (index < audioFiles.length - 1) {
			const silenceSafe = silenceFile.replace(/\\/g, "/");
			listContent += `file '${silenceSafe}'\n`;
		}
	});

	let listPath = path.join(tempDir, 'list.txt');
	await fs.writeFile(listPath, listContent);


	  execSync(
		`ffmpeg -y -f concat -safe 0 -i "${listPath}" -ar 44100 -ac 1 -b:a 128k "${outputPath}"`
	  );

	console.log("Final audio saved: ", outputPath);

}

// 	const audioBytes = await generateSpeech(personalizedText, outputPath);

// //   const apiKey = OPEN_API_KEY;
// //   if (!apiKey) {
// //     throw new Error('Missing OPENAI_API_KEY. Set it in your terminal before running this script.');
// //   }

// //   if (!inputText) {
// //     throw new Error('No text provided. Example: npm run generate:alarm-voice -- "Wake up. Your mission starts now."');
// //   }

// //   const response = await fetch('https://api.openai.com/v1/audio/speech', {
// //     method: 'POST',
// //     headers: {
// //       Authorization: `Bearer ${apiKey}`,
// //       'Content-Type': 'application/json',
// //     },
// //     body: JSON.stringify({
// //       model: 'gpt-4o-mini-tts',
// //       voice: 'ash', // You can choose different voices if supported by the API
// //       format: 'mp3',
// //       input: inputText,
// //     }),
// //   });

// //   if (!response.ok) {
// //     const errText = await response.text();
// //     throw new Error(`TTS request failed (${response.status}): ${errText}`);
// //   }

// //   const bytes = Buffer.from(await response.arrayBuffer());

//   await fs.mkdir(path.dirname(outputPath), { recursive: true });
//   await fs.writeFile(outputPath, audioBytes);

//   console.log(`Saved AI voice MP3 to: ${outputPath}`);
//   console.log('Rebuild Android app to package updated raw resource.');
// }

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
