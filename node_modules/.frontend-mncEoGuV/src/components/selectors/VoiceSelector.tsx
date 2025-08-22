import { useRef } from "react";
import type { VoiceId } from "../../data/voices";
import { VOICES } from "../../data/voices";

export default function VoiceSelector({
  value,
  onChange,
}: {
  value: VoiceId;
  onChange: (v: VoiceId) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelect = (voiceId: VoiceId, sample: string) => {
    onChange(voiceId);

    // Stop any currently playing sample
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Play new sample
    const newAudio = new Audio(sample);
    audioRef.current = newAudio;
    newAudio.play().catch(() => {
      console.warn("Autoplay prevented by browser ❗");
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Voice Over
      </label>

      {/* Grid of voices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {VOICES.map((v) => {
          const selected = v.id === value;
          return (
            <div
              key={v.id}
              onClick={() => handleSelect(v.id, v.sampleVoice)}
              className={`p-4 rounded-lg border cursor-pointer transition 
                ${
                  selected
                    ? "border-brand-600 bg-brand-50 shadow-md"
                    : "border-gray-200 hover:border-brand-400 hover:shadow-sm"
                }`}
            >
              <p className="font-medium text-gray-900">{v.label}</p>
              <p className="text-xs text-gray-500 mt-1">Click to preview</p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Voice affects TTS generation (not preview audio).
      </p>
    </div>
  );
}
