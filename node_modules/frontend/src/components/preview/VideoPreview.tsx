import React from "react";

interface VideoPreviewProps {
  isRendering: boolean;
  videoUrl?: string; // URL of the generated video
}

export default function VideoPreview({ isRendering, videoUrl }: VideoPreviewProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Title or status */}
      <div
        className={`text-lg font-semibold text-center mb-3 ${
          videoUrl ? "text-green-600" : "text-gray-800"
        }`}
      >
        <br />
        {isRendering ? "Rendering..." : videoUrl ? "Here is your video" : ""}
      </div>

      {/* Preview Container with fixed portrait aspect ratio (9:16) */}
      <div className="relative w-full max-w-sm">
        <div className="aspect-[9/16] border rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          {/* Loader */}
          {isRendering && (
            <div className="flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-brand-600 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                Rendering video...
              </span>
            </div>
          )}

          {/* Video Output */}
          {!isRendering && videoUrl && (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              controls
              muted
              autoPlay
              loop
            />
          )}

          {/* Placeholder */}
          {!isRendering && !videoUrl && (
            <span className="text-gray-500 text-lg">Your video goes here</span>
          )}
        </div>
      </div>
    </div>
  );
}
