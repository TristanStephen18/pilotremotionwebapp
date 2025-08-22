import {Routes, Route} from 'react-router-dom';
import Landing from './pages/Landing';
import RedditVideoPage from './pages/RedditVideoPage';
import StoryTellingPage from './pages/StoryTellingPage';
import InformativeVideoPage from './pages/InformativeVideoPage';
import QuoteVideoPage from './pages/QuoteSpotlight';

export default function RoutesView() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/reddit" element={<RedditVideoPage />} />
      <Route path="/storytelling" element={<StoryTellingPage />} />
      <Route path="/informative" element={<InformativeVideoPage />} />
      <Route path="/QuoteSpotlight" element={<QuoteVideoPage />} />
    </Routes>
  );
}
