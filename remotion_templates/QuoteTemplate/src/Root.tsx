import { Composition } from "remotion";
import { QuoteComposition } from "./Composition";
import quoteData from "../data/quotedata.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuoteSpotlight"
        component={QuoteComposition}
        durationInFrames={210}
        fps={30}
        height={1920}
        width={1080}
        defaultProps={{
          quote: quoteData.quote,
          author:quoteData.author,
          bgimage:quoteData.backgroundimage
        }}
      />
    </>
  );
};
