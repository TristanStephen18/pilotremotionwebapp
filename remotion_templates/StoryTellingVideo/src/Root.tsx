// src/RemotionRoot.tsx
import { Composition} from "remotion";
import { MyVideo } from "./Videos";
import storyData from "../data/script.json";
// import sound from "../data/soundloc.json";
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
        backgroundVideo: backgroundData.backgroundSrc,
      }}
    />
  );
};
