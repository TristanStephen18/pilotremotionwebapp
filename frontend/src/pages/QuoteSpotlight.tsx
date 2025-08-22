import { useState } from "react";
import TwoPane from "../components/layout/TwoPane";
import VideoPreview from "../components/preview/VideoPreview";

export default function QuoteVideoPage() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [bgImagePreview, setBgImagePreview] = useState<string | undefined>();
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();

  // Handle file selection + preview
  const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgImageFile(file);
      setBgImagePreview(URL.createObjectURL(file)); // Local preview
    }
  };

  // Send request to backend with FormData
  const handleGenerateVideo = async () => {
    if (!quote.trim()) {
      alert("Please enter a quote before generating the video.");
      return;
    }

    setIsRendering(true);
    setVideoUrl(undefined);

    try {
      const formData = new FormData();
      formData.append("quote", quote);
      formData.append("author", author);
      if (bgImageFile) {
        formData.append("background", bgImageFile); // attach image file
      }

      const res = await fetch("http://localhost:5000/generate-video-quote", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Video generation failed");
      }

      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url);
      }
    } catch (err) {
      console.error("❌ Error generating video:", err);
      alert("Something went wrong while generating the video.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <TwoPane
      title="Quote Video"
      subtitle="Enter a quote, author, and upload background image to render your video."
      left={
        <div className="space-y-6">
          {/* Quote input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quote
            </label>
            <textarea
              className="w-full input"
              rows={4}
              placeholder="Enter your quote..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          {/* Author input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              className="w-full input"
              placeholder="Author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* Background image upload */}
          {/* Background image upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Background Image
            </label>

            <label
              htmlFor="bg-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-gray-50 transition"
            >
              {bgImagePreview ? (
                <img
                  src={bgImagePreview}
                  alt="Background preview"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 01.9 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              )}
              <input
                id="bg-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadBackground}
                className="hidden"
              />
            </label>
          </div>

          {/* Generate video button */}
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
