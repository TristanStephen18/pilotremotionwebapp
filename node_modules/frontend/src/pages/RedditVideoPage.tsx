import { useState } from "react";
import TwoPane from "../components/layout/TwoPane";
import BackgroundSelector from "../components/selectors/BackgroundSelector";
import VoiceSelector from "../components/selectors/VoiceSelector";
import FontSelector from "../components/selectors/FontSelector";
import VideoPreview from "../components/preview/VideoPreview";
import type { BackgroundType } from "../remotion/type";
import type { VoiceId } from "../data/voices";

export default function RedditVideoPage() {
  const [redditUrl, setRedditUrl] = useState("");
  const [bg, setBg] = useState<{ type: BackgroundType; value: string }>({
    type: "video",
    value: "/videos/minecraft/m4.mp4",
  });
  const [voice, setVoice] = useState<VoiceId>("21m00Tcm4TlvDq8ikWAM");
  const [font, setFont] = useState(
    "Inter, ui-sans-serif, system-ui, sans-serif"
  );
  const [isRendering, setIsRendering] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [story, setStory] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  const extractRedditPost = async (url: string) => {
    try {
      setExtracting(true);
      setStory("");
      setVideoUrl("");

      // Strip query parameters
      const cleanUrl = url.split("?")[0];

      // Append .json
      const jsonUrl = cleanUrl.endsWith(".json")
        ? cleanUrl
        : cleanUrl + ".json";

      const res = await fetch(jsonUrl);
      const data = await res.json();

      const post = data[0]?.data?.children[0]?.data;
      const postTitle = post?.title?.trim() || "";
      const postText = post?.selftext?.trim() || "";

      // Decide separator
      const endsWithPunctuation = /[.!?]$/.test(postTitle);
      const separator = endsWithPunctuation ? "" : ".";

      const combined = `${postTitle}${separator} ${postText}`;

      setStory(combined);
      setExtracting(false);

      console.log(combined);

      return combined; // Return combined content
    } catch (err) {
      console.error(err);
      alert("Failed to extract Reddit post. Check the URL.");
      setExtracting(false);
      return "";
    }
  };

  const handleUrlChange = async (url: string) => {
    setRedditUrl(url);

    // Auto-extract when URL is valid and complete
    if (url && isValidRedditUrl(url)) {
      await extractRedditPost(url);
    }
  };

  const isValidRedditUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname.includes("reddit.com") ||
        parsedUrl.hostname.includes("redd.it")
      );
    } catch {
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!story && redditUrl) {
      // If we don't have story yet but have a URL, extract first
      const extractedStory = await extractRedditPost(redditUrl);
      if (!extractedStory) {
        alert("No story content found. Please check the Reddit URL.");
        return;
      }
    }

    if (!story) {
      alert("Please provide a valid Reddit URL with story content.");
      return;
    }

    setIsRendering(true);
    setVideoUrl(undefined);

    try {
      // Call the backend to generate video using the extracted Reddit story
      const res = await fetch("http://localhost:5000/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story,
          voiceId: voice,
          templatename: "RedditStoryVideo",
          backgroundSrc: bg.value,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url); // Set the generated video URL
      } else {
        throw new Error("No video URL returned from server");
      }
    } catch (err) {
      console.error("Error generating video:", err);
      alert("Failed to generate video. Please try again.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <TwoPane
      title="Reddit Story Video"
      subtitle="Paste a Reddit post URL and configure your video."
      left={
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reddit Post URL
            </label>
            <input
              type="url"
              className="w-full input"
              placeholder="https://www.reddit.com/r/AmItheAsshole/comments/..."
              value={redditUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              We'll fetch the post text automatically when you paste a valid
              URL.
            </p>
            {extracting && (
              <p className="text-xs text-blue-500">
                Extracting post content...
              </p>
            )}
            {story && !extracting && (
              <p className="text-xs text-green-500">
                ✓ Post content loaded ({story.length} characters)
              </p>
            )}
          </div>

          <BackgroundSelector value={bg} onChange={setBg} />
          <VoiceSelector value={voice} onChange={setVoice} />
          {/* <FontSelector value={font} onChange={setFont} /> */}

          <div className="pt-2">
            <button
              className="btn-primary w-full"
              onClick={handleGenerate}
              disabled={extracting || isRendering || !story}
            >
              {extracting
                ? "Extracting..."
                : isRendering
                ? "Generating Video..."
                : "Generate Video"}
            </button>
          </div>
        </div>
      }
      right={<VideoPreview isRendering={isRendering} videoUrl={videoUrl} />}
    />
  );
}
