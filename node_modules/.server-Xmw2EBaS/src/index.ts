import express from "express";
import fs from "fs";
import { Readable } from "stream";
import { ElevenLabsClient } from "elevenlabs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getAudioDurationInSeconds from "get-audio-duration";
import { staticFile } from "remotion";
import { waitForDebugger } from "inspector";
import multer from "multer";

dotenv.config();

const app = express();

const uploadDir = path.join(__dirname, "../../remotion_templates/QuoteTemplate/public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `bg-${Date.now()}${ext}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

app.use(cors());

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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

async function setStoryTellingAssets(
  story: string,
  voiceId: string = "CwhRBWXzGAHq8TQ4Fs17",
  templatename: string = "RedditStoryVideo",
  backgroundSrc: string
) {
  console.log("🎤 Generating voiceover...");

  const audioStream = await elevenLabs.generate({
    voice: voiceId,
    model_id: "eleven_multilingual_v2",
    text: story,
  });

  const buffer = await streamToBuffer(audioStream as Readable);

  const remotionRoot = path.join(process.cwd(), "..", "remotion_templates", templatename);

  const dataDir = path.join(remotionRoot, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const audioDir = path.join(remotionRoot, "public", "audios");
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  const audioPath = path.join(audioDir, "voice.mp3");

  fs.writeFileSync(audioPath, buffer);
  console.log(`✅ Voiceover saved to remotion_templates/${templatename}/public/audios/voice.mp3`);

  const duration = await getAudioDurationInSeconds(audioPath);
  console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);

  fs.writeFileSync(
    path.join(dataDir, "script.json"),
    JSON.stringify({ story, duration }, null, 2)
  );

  fs.writeFileSync(
    path.join(dataDir, "background.json"),
    JSON.stringify({ backgroundSrc }, null, 2)
  );

  console.log("✅ script.json updated with duration");
}

app.post("/api/story", async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    res.json({ story: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

app.post("/api/trivia", async (req, res) => {
  const { topics } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Give me fun and informative facts about the following topics: ${topics}.
  
  Requirements:
  - Start your response with "Did you know?"
  - Write in plain text, not markdown or bullet points.
  - Keep them informative and accurate, not trivia-style or overly playful.
  - Your response should be at 2 sentences maximum for each topic, for example you responded to a topic about science, provide only two fun facts about it and if its the only topic end there and if not provide another two sentence fun fact about the remaining topics.
  - Each topic should only have one paragraph.
  - If you have more than 1 topic, the starting sentence of the second to the last topic should be "Did you also know" then add the fun facts`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ trivia: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate facts." });
  }
});

app.post("/generate-video", async (req, res) => {
  try {
    const {
      story,
      voiceId = "CwhRBWXzGAHq8TQ4Fs17",
      templatename = "RedditStoryVideo",
      backgroundSrc,
    } = req.body;

    console.log("📩 Received request with story:", story);

    // Generate voiceover audio
    await setStoryTellingAssets(story, voiceId, templatename, backgroundSrc);

    // Locate Remotion entry
    const entry = path.join(__dirname, `../../remotion_templates/${templatename}/src/index.ts`);
    console.log("📂 Bundling Remotion project from:", entry);

    const bundleLocation = await bundle(entry);

    // Load compositions
    const comps = await getCompositions(bundleLocation, {
      inputProps: { story },
    });
    console.log(
      "📑 Found compositions:",
      comps.map((c) => c.id)
    );

    const comp = comps.find((c) => c.id === "RedditNarration");
    if (!comp) {
      console.error("❌ Composition 'RedditNarration' not found!");
      return res.status(404).json({ error: "Composition not found" });
    }

    // Load script.json for story + duration
    const scriptData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, `../../remotion_templates/${templatename}/data/script.json`),
        "utf-8"
      )
    );

    // Normalize backgroundSrc (remove leading slash if any)
    const normalizedBackgroundSrc = backgroundSrc?.replace(/^\/+/, "");
    console.log("📂 Normalized background source:", normalizedBackgroundSrc);

    // 🔑 Simplified inputProps
    const inputProps = {
      story: scriptData.story,
      voiceoverPath: staticFile("audios/voice.mp3"),
      duration: scriptData.duration,
      backgroundVideo: normalizedBackgroundSrc,
    };

    console.log("📁 Final inputProps for Remotion:", inputProps);

    // Render output video
    const outputFile = `out-${Date.now()}.mp4`;
    const outputLocation = path.join(__dirname, "generatedvideos", outputFile);

    console.log("🎬 Rendering video to:", outputLocation);

    await renderMedia({
      serveUrl: bundleLocation,
      composition: comp,
      codec: "h264",
      outputLocation,
      inputProps,
    });

    console.log("✅ Render complete!");

    return res.json({
      url: `http://localhost:5000/generatedvideos/${outputFile}`,
    });
  } catch (err: any) {
    console.error("❌ Internal error while generating video:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

//Quote Spotlight Video Generation
async function setJsonQuotesData(
  quote: string,
  author: string,
  backgroundimage: string
) {
  const remotionRoot = path.join(process.cwd(), "..", "remotion_templates","QuoteTemplate");

  const dataDir = path.join(remotionRoot, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // Store background info
  fs.writeFileSync(
    path.join(dataDir, "quotedata.json"),
    JSON.stringify({ quote, author, backgroundimage }, null, 2)
  );

  console.log(
    "✅ quotedata.json updated with quote, author, and background image (URL)"
  );
}

app.post(
  "/generate-video-quote",
  upload.single("background"),
  async (req, res) => {
    try {
      const { quote, author } = req.body;
      const bgFile = req.file?.filename;

      console.log("📩 Received quote request with story:", quote);
      console.log("🖼️ Background image saved as:", bgFile);

      await setJsonQuotesData(quote, author, `images/${bgFile}`);

      const entry = path.join(__dirname, `../../remotion_templates/QuoteTemplate/src/index.ts`);
      const bundleLocation = await bundle(entry);

      const comps = await getCompositions(bundleLocation);
      const comp = comps.find((c) => c.id === "QuoteSpotlight");
      if (!comp) {
        return res.status(404).json({ error: "Composition not found" });
      }

      const outputFile = `out-${Date.now()}.mp4`;
      const outputLocation = path.join(
        __dirname,
        "generatedvideos",
        outputFile
      );
      console.log("🎬 Rendering video to:", outputLocation);

      await renderMedia({
        serveUrl: bundleLocation,
        composition: comp,
        codec: "h264",
        outputLocation,
      });

      console.log("✅ Render complete!");

      return res.json({
        url: `http://localhost:5000/generatedvideos/${outputFile}`,
      });
    } catch (err: any) {
      console.error("❌ Internal error while generating video:", err);
      return res.status(500).json({ error: err.message || "Unknown error" });
    }
  }
);

app.use(express.static(__dirname));

// fetchAudio("hehehehehehehehehehehehehehehe", "CwhRBWXzGAHq8TQ4Fs17", "StoryTellingVideo");

app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
