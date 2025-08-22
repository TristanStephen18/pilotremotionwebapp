import { useMemo, useState } from "react";
import TwoPane from "../components/layout/TwoPane";
import BackgroundSelector from "../components/selectors/BackgroundSelector";
import VoiceSelector from "../components/selectors/VoiceSelector";
import FontSelector from "../components/selectors/FontSelector";
import VideoPreview from "../components/preview/VideoPreview";
import type { BackgroundType } from "../remotion/type";
import type { VoiceId } from "../data/voices";

const TOPIC_GROUPS = [
  { label: "Science", items: ["Physics", "Biology", "Chemistry", "Space"] },
  { label: "History", items: ["Ancient", "Medieval", "Modern", "WWII"] },
  {
    label: "Medicine",
    items: ["Anatomy", "Diseases", "Therapies", "Pharmacology"],
  },
  { label: "Sports", items: ["Football", "Basketball", "Tennis", "Olympics"] },
  { label: "Tech", items: ["AI", "Web", "Security", "Gadgets"] },
];

export default function InformativeVideoPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [trivia, setTrivia] = useState("");
  const [bg, setBg] = useState<{ type: BackgroundType; value: string }>({
    type: "video",
    value: "/videos/minecraft/m4.mp4",
  });
  const [voice, setVoice] = useState<VoiceId>("21m00Tcm4TlvDq8ikWAM");
  const [font, setFont] = useState(
    "Inter, ui-sans-serif, system-ui, sans-serif"
  );
  const [isRendering, setIsRendering] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined); // ✅ added

  const toggleTopic = (t: string) => {
    setSelected((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleGenerateTrivia = async () => {
    const topics = selected.length ? selected.join(", ") : "General Knowledge";
    setLoadingAI(true);
    try {
      const res = await fetch("http://localhost:5000/api/trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });
      const data = await res.json();
      if (data.trivia) {
        setTrivia(data.trivia);
      } else {
        setTrivia(`⚠️ AI could not generate trivia for ${topics}.`);
      }
    } catch (err) {
      console.error(err);
      setTrivia("❌ Error connecting to AI server.");
    } finally {
      setLoadingAI(false);
    }
  };

  // ✅ Same rendering logic as StoryTellingPage
  const handleGenerateVideo = async () => {
    if (!trivia.trim()) {
      alert("Please generate or enter trivia before creating a video.");
      return;
    }

    setIsRendering(true);
    setVideoUrl(undefined);

    try {
      const res = await fetch("http://localhost:5000/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: trivia,
          voiceId: voice,
          templatename: "InformativeVideo",
          backgroundSrc: bg.value,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url);
      }
      console.log("Video generation response:", data.url);
    } catch (err) {
      console.error("Error generating video:", err);
    } finally {
      setIsRendering(false);
    }
  };

  const topicPills = useMemo(() => TOPIC_GROUPS.flatMap((g) => g.items), []);

  return (
    <TwoPane
      title="Informative Video"
      subtitle="Select topics, generate trivia, then style your explainer."
      left={
        <div className="space-y-6">
          {/* Topics */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {topicPills.map((t) => {
                const active = selected.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={
                      active
                        ? "px-3 py-1.5 rounded-full bg-brand-600 text-white"
                        : "px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50"
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <button
              className="btn-outline mt-2"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>

          <div>
            <button
              className="btn-primary"
              onClick={handleGenerateTrivia}
              disabled={loadingAI}
            >
              {loadingAI ? "Generating Trivia..." : "Generate Trivia"}
            </button>
          </div>

          {/* Trivia textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              AI Trivia
            </label>
            <textarea
              className="w-full input"
              rows={6}
              placeholder="AI-generated trivia will appear here..."
              value={trivia}
              onChange={(e) => setTrivia(e.target.value)}
            />
          </div>

          <BackgroundSelector value={bg} onChange={setBg} />
          <VoiceSelector value={voice} onChange={setVoice} />
          {/* <FontSelector value={font} onChange={setFont} /> */}

          {/* Video generate */}
          <div>
            <button
              className="btn-primary w-full"
              onClick={handleGenerateVideo}
              disabled={isRendering}
            >
              {isRendering ? "Rendering..." : "Generate Video"}
            </button>
          </div>
        </div>
      }
      right={<VideoPreview isRendering={isRendering} videoUrl={videoUrl} />}
    />
  );
}
