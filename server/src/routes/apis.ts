import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";
import { GoogleGenerativeAI } from "@google/generative-ai";


const app = express();
dotenv.config();    
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});


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
  - Each topic should only have one paragraph.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ trivia: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate facts." });
  }
});