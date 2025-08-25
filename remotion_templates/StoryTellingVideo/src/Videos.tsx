import {
  AbsoluteFill,
  Audio,
  Video,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
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
        loop
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Dark overlay */}
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />

      {/* Sentence display */}
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
  
  const wordsPerLine = 8;
  const lines: Word[][] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine));
  }
  const lineBlocks: Word[][][] = [];
  for (let i = 0; i < lines.length; i += 2) {
    lineBlocks.push(lines.slice(i, i + 2));
  }

  const activeBlockIndex = lineBlocks.findIndex((block) => {
    const startFrame = Math.floor(block[0][0].start * fps);
    const lastLine = block[block.length - 1];
    const endFrame = Math.floor(lastLine[lastLine.length - 1].end * fps);
    return frame >= startFrame && frame <= endFrame;
  });

  if (activeBlockIndex === -1) return null;
  const activeBlock = lineBlocks[activeBlockIndex];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
        textAlign: "center",
        color: "white",
        fontSize: 68,
        fontFamily: '"Comic Neue", "Comic Sans MS", "Poppins", sans-serif',
        fontWeight: 600,
        lineHeight: 1.5,
        textShadow:
          "2px 2px 6px rgba(0,0,0,0.7), -2px -2px 6px rgba(0,0,0,0.5)",
      }}
    >
      {activeBlock.map((line, li) => (
        <p
          key={li}
          style={{
            margin: "8px 0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {line.map((w, i) => {
            const wordStartFrame = Math.floor(w.start * fps);
            if (frame < wordStartFrame) return null;

            const isLatest =
              i ===
              line.findIndex(
                (ww) =>
                  frame >= Math.floor(ww.start * fps) &&
                  frame < Math.floor(ww.end * fps)
              );

            const bg = isLatest ? "#FF8C00" : "transparent";

            return (
              <span
                key={i}
                style={{
                  backgroundColor: bg,
                  padding: isLatest ? "2px 6px" : undefined,
                  borderRadius: isLatest ? "4px" : undefined,
                  display: "inline-block",
                }}
              >
                {w.word}
              </span>
            );
          })}
        </p>
      ))}
    </AbsoluteFill>
  );
};
