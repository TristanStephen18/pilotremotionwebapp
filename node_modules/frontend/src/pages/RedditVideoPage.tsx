import { useState } from "react";
import TwoPane from "../components/layout/TwoPane";
import BackgroundSelector from "../components/selectors/BackgroundSelector";
import VoiceSelector from "../components/selectors/VoiceSelector";
import FontSelector from "../components/selectors/FontSelector";
import VideoPreview from "../components/preview/VideoPreview";
import type { BackgroundType } from "../remotion/type";
import type { VoiceId } from "../data/voices";

type StatusType = "success" | "error" | "info" | null;

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
  // const [title, setTitle] = useState("");
  // const [text, setText] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: null,
    message: "",
  });

  const extractRedditPost = async (url: string) => {
    try {
      setExtracting(true);
      setStory("");
      setPostTitle("");
      setPostText("");
      setVideoUrl("");
      setStatus({ type: "info", message: "Extracting Reddit post..." });

      const res = await fetch(
        `http://localhost:5000/api/reddit?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();

      const post = data[0]?.data?.children[0]?.data;
      const title = post?.title?.trim() || "";
      const text = post?.selftext?.trim() || "";

      if (!title && !text) {
        throw new Error("Empty post data");
      }

      setPostTitle(title);
      setPostText(text);

      const endsWithPunctuation = /[.!?]$/.test(title);
      const separator = endsWithPunctuation ? "" : ".";
      const combined = `${title}${separator} ${text}`;
      setStory(combined);
      setExtracting(false);

      console.log(combined);

      setStatus({
        type: "success",
        message: "✓ Post extracted successfully!",
      });

      return combined;
    } catch (err) {
      console.error(err);
      setExtracting(false);
      setStatus({
        type: "error",
        message: "❌ Failed to extract Reddit post. Please check the URL.",
      });
      return "";
    }
  };

  const handleUrlChange = async (url: string) => {
    setRedditUrl(url);
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
      const extractedStory = await extractRedditPost(redditUrl);
      if (!extractedStory) {
        return;
      }
    }

    if (!story) {
      setStatus({
        type: "error",
        message: "❌ Please provide a valid Reddit URL with story content.",
      });
      return;
    }

    setIsRendering(true);
    setVideoUrl(undefined);

    try {
      console.log(postText, postTitle);
      const res = await fetch("http://localhost:5000/generate-reddit-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story,
          voiceId: voice,
          templatename: "RedditStoryVideo",
          backgroundSrc: bg.value,
          title: postTitle,
          text: postText,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url);
      } else {
        throw new Error("No video URL returned from server");
      }
    } catch (err) {
      console.error("Error generating video:", err);
      setStatus({
        type: "error",
        message: "❌ Failed to generate video. Please try again.",
      });
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
          {/* Notification Banner */}
          {status.type && (
            <div
              className={`p-2 rounded-md text-sm ${
                status.type === "success"
                  ? "bg-green-100 text-green-800"
                  : status.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {status.message}
            </div>
          )}

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
          </div>

          {/* Post Displayer */}
          {story && (
            <div className="border rounded-md p-3 bg-gray-50 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">{postTitle}</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {postText || "(No body text)"}
              </p>
            </div>
          )}

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
