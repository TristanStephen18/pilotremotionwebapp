// src/RemotionRoot.tsx
import { Composition, staticFile } from "remotion";
import { MyVideo } from "./Videos";
import storyData from "../data/script.json";
import sound from "../data/soundloc.json";
import backgroundData from "../data/background.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RedditNarration"
      component={MyVideo}
      durationInFrames={Math.ceil(storyData.duration * 30)} 
      fps={30}
      height={1920}
      width={1080}
      defaultProps={{
        story: storyData.story,
        voiceoverPath: staticFile(sound.location || "audios/voice.mp3"),
        duration: storyData.duration,
        backgroundVideo: staticFile(backgroundData.backgroundSrc || "videos/minecraft/m5.mp4"),
      }}
    />
  );
};
