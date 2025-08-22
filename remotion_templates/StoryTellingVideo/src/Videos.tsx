import {
  AbsoluteFill,
  Audio,
  Loop,
  Sequence,
  Video,
  useVideoConfig,
  useCurrentFrame,
  spring
} from "remotion";

export const MyVideo: React.FC<{
  story: string;
  voiceoverPath: string;
  duration: number; 
  backgroundVideo: string;
}> = ({ story, voiceoverPath, duration, backgroundVideo }) => {
  const { fps } = useVideoConfig();

  const sentences = story.match(/[^.!?]+[.!?]+|\S+/g) || [story];
  const wordCounts = sentences.map((s) =>
    s.trim() ? s.trim().split(/\s+/).length : 1,
  );
  const totalWords = Math.max(
    1,
    wordCounts.reduce((a, b) => a + b, 0),
  );
  const totalFrames = Math.max(1, Math.round(duration * fps));

  const pauseSeconds = 0.45;
  const pauseFramesPerGap = Math.round(pauseSeconds * fps);
  const gaps = Math.max(0, sentences.length - 1);
  const totalPauseFrames = pauseFramesPerGap * gaps;

  const speechFramesAvailable = Math.max(1, totalFrames - totalPauseFrames);
  const baseFrames = wordCounts.map((wc) =>
    Math.floor((wc / totalWords) * speechFramesAvailable),
  );

  let speakFrames = baseFrames.map((f) => Math.max(1, f));
  let currentSum = speakFrames.reduce((a, b) => a + b, 0);
  let diff = speechFramesAvailable - currentSum;

  let i = 0;
  const maxIters = sentences.length * 4 + Math.abs(diff);
  let iters = 0;
  while (diff !== 0 && iters < maxIters) {
    if (diff > 0) {
      speakFrames[i % sentences.length] += 1;
      diff -= 1;
    } else if (diff < 0) {
      const idx = i % sentences.length;
      if (speakFrames[idx] > 1) {
        speakFrames[idx] -= 1;
        diff += 1;
      }
    }
    i++;
    iters++;
  }

  const startFrames: number[] = [];
  let acc = 0;
  for (let j = 0; j < sentences.length; j++) {
    startFrames.push(acc);
    acc += speakFrames[j];
    if (j < sentences.length - 1) {
      acc += pauseFramesPerGap;
    }
  }

  return (
    <AbsoluteFill>
      <Loop durationInFrames={totalFrames}>
        <Video
          src={backgroundVideo} 
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Loop>

      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />

      {sentences.map((sentence, idx) => (
        <Sequence
          key={idx}
          from={startFrames[idx]}
          durationInFrames={speakFrames[idx]}
        >
          <WordByWordSentence
            sentence={sentence}
            durationInFrames={speakFrames[idx]}
            fps={fps}
          />
        </Sequence>
      ))}

      <Audio src={voiceoverPath} />
    </AbsoluteFill>
  );
};

const WordByWordSentence: React.FC<{
  sentence: string;
  durationInFrames: number;
  fps: number;
}> = ({ sentence, durationInFrames, fps }) => {
  const frame = useCurrentFrame();
  const { fps: globalFps } = useVideoConfig();
  const words = sentence.trim().split(/\s+/);

  const framesPerWord = Math.max(
    3,
    Math.floor(durationInFrames / words.length),
  );

  const visibleCount = Math.min(
    words.length,
    Math.floor(frame / framesPerWord) + 1,
  );

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
        {words.slice(0, visibleCount).map((word, i) => {
          const wordStartFrame = i * framesPerWord;
          const isLatest = i === visibleCount - 1;

          // bounce zoom for the latest word
          const progress = spring({
            frame: frame - wordStartFrame,
            fps: globalFps,
            config: {
              damping: 8,
              stiffness: 120,
              mass: 0.5,
            },
          });

          const scale = isLatest ? 0.3 + progress * 1.1 : 1; // zoom in bounce
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
              {word}
            </span>
          );
        })}
      </p>
    </AbsoluteFill>
  );
};
