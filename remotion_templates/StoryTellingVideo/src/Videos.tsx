import {
  AbsoluteFill,
  Audio,
  Video,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  spring,
} from "remotion";
import script from "../data/script.json";

export const MyVideo: React.FC<{backgroundVideo: string}> = ({backgroundVideo}) => {
  const { fps } = useVideoConfig();
  const { words } = script as {
    story: string;
    duration: number;
    words: { word: string; start: number; end: number }[];
  };

  return (
    <AbsoluteFill>
      {/* Background looping video */}
      <Video
        src={staticFile(backgroundVideo)}
        muted
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />

      <SentenceBuilder words={words} fps={fps} />

      {/* Voiceover audio */}
      <Audio src={staticFile("audios/voice.mp3")} />
    </AbsoluteFill>
  );
};

type Word = { word: string; start: number; end: number };

const SentenceBuilder: React.FC<{
  words: Word[];
  fps: number;
}> = ({ words, fps }) => {
  const frame = useCurrentFrame();

  // 1. Group words into sentences by punctuation
  const sentences: Word[][] = [];
  let currentSentence: Word[] = [];

  words.forEach((w) => {
    currentSentence.push(w);
    if (/[.!?]/.test(w.word)) {
      sentences.push(currentSentence);
      currentSentence = [];
    }
  });
  if (currentSentence.length > 0) {
    sentences.push(currentSentence);
  }

  // 2. Find which sentence is active at this frame
  const activeSentenceIndex = sentences.findIndex((sentence) => {
    const startFrame = Math.floor(sentence[0].start * fps);
    const endFrame = Math.floor(sentence[sentence.length - 1].end * fps);
    return frame >= startFrame && frame <= endFrame;
  });

  if (activeSentenceIndex === -1) return null;

  const activeSentence = sentences[activeSentenceIndex];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
        textAlign: "center",
        color: "white",
        fontSize: 70,
        fontFamily: '"Comic Neue", "Comic Sans MS", "Poppins", sans-serif',
        fontWeight: 600,
        lineHeight: 1.5,
        textShadow:
          "2px 2px 6px rgba(0,0,0,0.7), -2px -2px 6px rgba(0,0,0,0.5)",
      }}
    >
      <p
        style={{
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        {activeSentence.map((w, i) => {
          const wordStartFrame = Math.floor(w.start * fps);

          // Only show words once their time has come
          if (frame < wordStartFrame) return null;

          const isLatest =
            i ===
            activeSentence.findIndex(
              (ww) =>
                frame >= Math.floor(ww.start * fps) &&
                frame < Math.floor(ww.end * fps)
            );

          // Bounce zoom for the active word
          const progress = spring({
            frame: frame - wordStartFrame,
            fps,
            config: { damping: 8, stiffness: 120, mass: 0.5 },
          });

          const scale = isLatest ? 0.3 + progress * 1.1 : 1;
          const bg = isLatest ? "#FF8C00" : "transparent";

          return (
            <span
              key={i}
              style={{
                backgroundColor: bg,
                padding: isLatest ? "6px 12px" : undefined,
                borderRadius: isLatest ? "8px" : undefined,
                transform: `scale(${scale})`,
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </p>
    </AbsoluteFill>
  );
};
