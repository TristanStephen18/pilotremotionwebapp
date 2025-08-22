import fs from "fs";
import path from "path";
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";
import "dotenv/config";
// import { sampleredditstory } from "../src/data/sampleredditstory";
import { getAudioDurationInSeconds } from "get-audio-duration"; 

const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function fetchAudio(story: string) {
  console.log("🎤 Generating voiceover...");

  const audioStream = await elevenLabs.generate({
    voice: "CwhRBWXzGAHq8TQ4Fs17", 
    model_id: "eleven_multilingual_v2",
    text: story,
  });

  const buffer = await streamToBuffer(audioStream as Readable);

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const audioDir = path.join(process.cwd(), "public", "audios");
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  const audioPath = path.join(audioDir, "voice.mp3");

  fs.writeFileSync(audioPath, buffer);
  console.log("✅ Voiceover saved to public/audios/voice.mp3");

  const duration = await getAudioDurationInSeconds(audioPath);
  console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);

  fs.writeFileSync(
    path.join(dataDir, "script.json"),
    JSON.stringify({ story, duration }, null, 2)
  );

  console.log("✅ script.json updated with duration");
}

// fetchAudio(sampleredditstory).catch(console.error);
