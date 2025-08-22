import {Link, Outlet, useLocation} from 'react-router-dom';
import RoutesView from './routes';

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl flex items-center gap-2 text-brand-700">
            <span className="text-2xl">🎬</span> Remotion Video Tool
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link className="hover:text-brand-700" to="/">Home</Link>
            <Link className="hover:text-brand-700" to="/reddit">Reddit Video</Link>
            <Link className="hover:text-brand-700" to="/storytelling">Storytelling Video</Link>
            <Link className="hover:text-brand-700" to="/informative">Informative Video</Link>
            <Link className="hover:text-brand-700" to="/QuoteSpotlight">Quote Spotlight</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <RoutesView />
      </main>
      <footer className="border-t mt-10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-500">
          Built with React + TypeScript + Remotion Player 🔨🤖🔧
        </div>
      </footer>
    </div>
  );
}
