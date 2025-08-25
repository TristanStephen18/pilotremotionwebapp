import {
  AbsoluteFill,
  Audio,
  Video,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  Sequence,
} from "remotion";
// ❌ removed script import as per request
import script from "../data/script.json";
import backgroundVideo from "../data/background.json";

export const MyVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const { title, text, words } = script as {
    title: string;
    text: string;
    duration: number;
    words: { word: string; start: number; end: number }[];
  };
  const bg = backgroundVideo as { backgroundSrc: string };

  const introDuration = 2 * fps; 

  return (
    <AbsoluteFill>
      {/* Background looping video */}
      <Video
        src={staticFile(backgroundVideo.backgroundSrc)}
        muted
        loop
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />

      <Sequence from={0} durationInFrames={introDuration}>
        <RedditPost title={title} text={text} />
      </Sequence>

      <Sequence from={introDuration}>
        <SentenceBuilder words={words} fps={fps} />
        <Audio src={staticFile("audios/voice.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};

const RedditPost: React.FC<{ title: string; text: string }> = ({
  title,
  text,
}) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center", // center vertically
        alignItems: "center", // center horizontally
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Container card */}
      <div
        style={{
          backgroundColor: "white",
          color: "#1a1a1b",
          borderRadius: 16,
          padding: "60px 80px",
          maxWidth: "1200px",
          width: "90%",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        {/* Top bar: avatar + subreddit + timestamp */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <img
            src={staticFile("images/avatar.png")}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              marginRight: 18,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: "#1a1a1b",
              }}
            >
              r/AskReddit
            </span>
            <span
              style={{
                fontSize: 22,
                color: "#787c7e",
              }}
            >
              10 hrs ago
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            margin: "20px 0",
            lineHeight: 1.4,
          }}
        >
          {title.trim()}
        </h1>

        {/* Text */}
        <p
          style={{
            fontSize: 28,
            lineHeight: 1.8,
            color: "#1a1a1b",
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ------------------ SentenceBuilder stays same ------------------
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
