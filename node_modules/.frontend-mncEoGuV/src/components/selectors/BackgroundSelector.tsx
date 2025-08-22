import { useState } from "react";
import type { BackgroundType } from "../../remotion/type";

interface BackgroundSelectorProps {
  value: { type: BackgroundType; value: string };
  onChange: (bg: { type: BackgroundType; value: string }) => void;
}

const VIDEO_GROUPS: Record<string, string[]> = {
  Minecraft: ["/videos/minecraft/m1.mp4", "/videos/minecraft/m2.mp4","/videos/minecraft/m3.mp4","/videos/minecraft/m4.mp4","/videos/minecraft/m5.mp4", "/videos/minecraft/m6.mp4"],
  "Subway Surfers": [
    "/videos/subwaysurfers/ss1.mp4",
    "/videos/subwaysurfers/ss2.mp4",
    "/videos/subwaysurfers/ss3.mp4",
    "/videos/subwaysurfers/ss4.mp4",
    "/videos/subwaysurfers/ss5.mp4",
    "/videos/subwaysurfers/ss6.mp4",
    "/videos/subwaysurfers/ss7.mp4",
  ],
  "Temple Run": ["/videos/templerun/tr1.mp4", "/videos/templerun/tr2.mp4", "/videos/templerun/tr3.mp4"],
  "UGC": [
    "/videos/ugc/ugc1.mp4", 
    "/videos/ugc/ugc2.mp4",
    "/videos/ugc/ugc3.mp4",
    "/videos/ugc/ugc4.mp4",
    "/videos/ugc/ugc5.mp4", 
  ],
};

export default function BackgroundSelector({
  value,
  onChange,
}: BackgroundSelectorProps) {
  const folderNames = Object.keys(VIDEO_GROUPS);
  const [activeFolder, setActiveFolder] = useState<string>(folderNames[0]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Background Video
      </label>

      {/* Folder Tabs */}
      <div className="flex gap-3">
        {folderNames.map((folder) => (
          <button
            key={folder}
            type="button"
            className={`px-3 py-1.5 rounded-lg border ${
              activeFolder === folder
                ? "bg-brand-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setActiveFolder(folder)}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* Video picker */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {VIDEO_GROUPS[activeFolder].map((vid) => {
          const selected = value.value === vid;
          return (
            <div
              key={vid}
              className={`relative rounded-lg overflow-hidden border-4 cursor-pointer flex-shrink-0 ${
                selected ? "border-brand-600" : "border-transparent"
              }`}
              onClick={() => onChange({ type: "video", value: vid })}
            >
              <video
                src={vid}
                className="w-28 h-48 object-cover"
                muted
                loop
                preload="metadata"
                onMouseEnter={(e) =>
                  (e.currentTarget as HTMLVideoElement).play()
                }
                onMouseLeave={(e) =>
                  (e.currentTarget as HTMLVideoElement).pause()
                }
              />
              {selected && (
                <div className="absolute inset-0 bg-brand-600/30 border-2 border-brand-600"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
