import express from "express";
import { generateMessage } from "../services/generateMessage.js";
import { generatePrompt } from "../services/generatePrompt.js";
import { generateSpeech } from "../services/generateSpeech.js";
import { getSignedAudioUrl } from "../services/getSignedAudioUrl.js";
import { listVoices } from "../services/outputVoiceID.js";
import { uploadAudio } from "../services/uploadAudio.js";

// Router instance to define routes related to alarms
const router = express.Router();

router.get("/voices", (req, res) => {
	res.json({ voices: listVoices() });
});

router.get("/alarms/:fileKey/download-url", async (req, res) => {
  try {
    const { fileKey } = req.params;
    const url = await getSignedAudioUrl(fileKey, 300); // 300/60 = 5 min
    res.json({ download_url: url });
  } catch (error) {
    console.error("Signed URL error:", error);
    res.status(500).json({ error: "Failed to create download URL" });
  }
});

router.post("/generate-alarm", async (req, res) => {
	console.log("BODY TEST: ");
	try {
		console.log("Pre-test")
		const { name, wakeTime, voiceKey, wakeReason} = req.body;

		console.log(req.body);

		console.log("Received alarm generation request with:", { name, wakeTime, voiceKey, wakeReason });

		// Plan to add name and wakeTime from user input
		const prompt = generatePrompt(name, wakeTime, wakeReason);
		const text = await generateMessage(prompt);	
		const audio = await generateSpeech(text, voiceKey);

		const ts = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `${voiceKey}-${name}-${ts}-alarm.mp3`;
		await uploadAudio(audio, filename);

		res.json({ 
			file_key: filename,
		});

	} catch (error) {
		const { name, wakeTime, wakeReason, voiceKey } = req.body;
		console.error("Error generating alarm:", error);
		console.error("Parameters received:", { name, wakeTime, wakeReason, voiceKey });
		res.status(500).json({ error: "Failed to generate alarm" });
	}
});

export default router;