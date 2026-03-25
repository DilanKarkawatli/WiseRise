import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

# Load the model
model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
    device_map="cpu",
    dtype=torch.float32,
    attn_implementation=None,
)

# Generate speech with specific instructions
wavs, sr = model.generate_custom_voice(
    text="Wake up, you've got work to do",
    language="english", 
    speaker="Ryan",
    instruct="Calm and wise", 
)

# Save the generated audio
sf.write("output_custom_voice.wav", wavs[0], sr)
