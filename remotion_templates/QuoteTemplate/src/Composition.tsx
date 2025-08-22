import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";
import { useCallback } from "react";

const { fontFamily } = loadFont();

export const QuoteComposition: React.FC<{
  quote: string;
  author: string;
  bgimage: string;
}> = ({ quote, author, bgimage }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation parameters
  const quoteMarkScale = spring({
    frame: frame * 0.7,
    fps,
    config: { damping: 15, stiffness: 120 },
    durationInFrames: 45,
  });

  const quoteMarkOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bgOpacity = interpolate(frame, [30, 90], [0, 0.7], {
    extrapolateRight: "clamp",
  });

  const textPush = spring({
    frame: frame - 30,
    fps,
    config: { damping: 15, stiffness: 50 },
    durationInFrames: 90,
  });

  const wordAppear = useCallback(
    (index: number) => {
      return interpolate(frame - 45 - index * 7, [0, 45], [0, 1], {
        extrapolateRight: "clamp",
      });
    },
    [frame]
  );

  const authorAppear = spring({
    frame: frame - 45 - quote.split(" ").length * 7 - 15,
    fps,
    config: { damping: 15, stiffness: 80 },
    durationInFrames: 45,
  });

  const words = quote.split(" ");

  // scale fonts relative to height (since portrait 1080x1920)
  const baseFontSize = height * 0.050;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background */}
      <AbsoluteFill style={{ opacity: bgOpacity }}>
        <Img
          src={staticFile(bgimage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
          }}
        />
      </AbsoluteFill>

      {/* Quotation mark */}
      <div
        style={{
          position: "absolute",
          fontSize: height * 0.12,
          fontFamily,
          color: "rgba(255,255,255,0.8)",
          fontStyle: "italic",
          opacity: quoteMarkOpacity,
          transform: `scale(${quoteMarkScale})`,
          top: height * 0.12,
          left: width * 0.1,
          lineHeight: 0.8,
          zIndex: 1,
        }}
      >
        “
      </div>

      {/* Main quote text */}
      <div
        style={{
          position: "absolute",
          fontFamily,
          color: "white",
          fontSize: baseFontSize,
          fontWeight: 400,
          lineHeight: 1.6,
          textAlign: "center",
          zIndex: 2,
          width: "80%", // wide block for portrait
          left: "10%",
          top: height * 0.3,
          transform: `translateY(${interpolate(textPush, [0, 1], [50, 0])}px)`,
        }}
      >
        {words.map((word, i) => {
          const opacity = wordAppear(i);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginLeft: 12,
                opacity,
                fontStyle: i % 3 === 0 ? "italic" : "normal",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Author */}
      <div
        style={{
          position: "absolute",
          fontFamily,
          color: "rgba(255,255,255,0.9)",
          fontSize: baseFontSize * 0.8,
          fontWeight: 600,
          bottom: height * 0.15,
          right: width * 0.1,
          opacity: authorAppear,
          transform: `translateY(${interpolate(
            authorAppear,
            [0, 1],
            [40, 0]
          )}px)`,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          paddingTop: 15,
          textAlign: "right",
          width: "80%",
        }}
      >
        — {author}
      </div>
    </AbsoluteFill>
  );
};
