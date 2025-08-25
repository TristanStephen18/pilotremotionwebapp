import { Composition, staticFile } from "remotion";
import { MyVideo } from "./Videos";
import storyData from "../data/script.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RedditNarration"
      component={MyVideo}
      durationInFrames={Math.ceil((storyData.duration + 2) * 30)} 
      fps={30}
      height={1920}
      width={1080}
      defaultProps={{
        story: storyData.story,
        voiceoverPath: staticFile("audios/voice.mp3"),
        duration: storyData.duration,
      }}
    />
  );
};
