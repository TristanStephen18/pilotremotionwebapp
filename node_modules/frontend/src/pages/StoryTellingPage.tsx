import { useState } from "react";
import TwoPane from "../components/layout/TwoPane";
import BackgroundSelector from "../components/selectors/BackgroundSelector";
import VoiceSelector from "../components/selectors/VoiceSelector";
import FontSelector from "../components/selectors/FontSelector";
import VideoPreview from "../components/preview/VideoPreview";
import type { BackgroundType } from "../remotion/type";
import type { VoiceId } from "../data/voices";

export default function StoryTellingPage() {
  const [story, setStory] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [bg, setBg] = useState<{ type: BackgroundType; value: string }>({
    type: "video",
    value: "/videos/minecraft/m4.mp4",
  });
  const [voice, setVoice] = useState<VoiceId>("JBFqnCBsd6RMkjVDRZzb");
  const [font, setFont] = useState('"Playfair Display", Georgia, serif');
  const [isRendering, setIsRendering] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined); // ✅ added

  // Call your backend Gemini AI route
  const handleUseAI = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAI(true);
    try {
      const res = await fetch("http://localhost:5000/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.story) {
        setStory(data.story);
      } else {
        setStory("⚠️ AI could not generate a story. Try again.");
      }
    } catch (err) {
      console.error(err);
      setStory("❌ Error connecting to AI server.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerate = async () => {
    setIsRendering(true);
    setVideoUrl(undefined);

    try {
      const res = await fetch("http://localhost:5000/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story,
          voiceId: voice,
          templatename: "StoryTellingVideo",
          backgroundSrc: bg.value,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url); // 👈 here you’ll get http://localhost:5000/out.mp4
      }
      console.log("Video generation response:", data.url);
    } catch (err) {
      console.error("Error generating video:", err);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <TwoPane
      title="Storytelling Video"
      subtitle="Write your story or let AI draft it, then style the video."
      left={
        <div className="space-y-6">
          {/* Story textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Story
            </label>
            <textarea
              rows={8}
              className="w-full input"
              placeholder="Paste or type your story here..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
          </div>

          {/* AI prompt section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Create with AI (prompt)
            </label>
            <textarea
              rows={3}
              className="w-full input"
              placeholder="e.g., Cozy fantasy about a lost traveler who meets a talking fox"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              className="btn-outline"
              onClick={handleUseAI}
              disabled={loadingAI}
            >
              {loadingAI ? "Generating with AI..." : "Generate Story with AI"}
            </button>
          </div>

          {/* Customization selectors */}
          <BackgroundSelector value={bg} onChange={setBg} />
          <VoiceSelector value={voice} onChange={setVoice} />
          {/* <FontSelector value={font} onChange={setFont} /> */}

          {/* Video generate */}
          {/* Video generate */}
          <div>
            <button
              className="btn-primary w-full"
              onClick={handleGenerate}
              disabled={isRendering}
            >
              {isRendering ? "Rendering..." : "Generate Video"}
            </button>
          </div>
        </div>
      }
      right={
        <VideoPreview
          isRendering={isRendering}
          videoUrl={videoUrl} // Replace with generated video path
        />
      }
    />
  );
}
