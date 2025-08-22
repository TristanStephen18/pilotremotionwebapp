import {Link} from 'react-router-dom';

const Card = ({
  to, title, desc, emoji, gradient
}: {to: string; title: string; desc: string; emoji: string; gradient: string}) => (
  <Link to={to} className="group block">
    <div className="relative overflow-hidden rounded-2xl shadow-card border border-gray-100 bg-white">
      <div className={`h-28 ${gradient}`} />
      <div className="p-6 -mt-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-md border border-gray-100 text-3xl">
          {emoji}
        </div>
        <h3 className="mt-4 text-xl font-semibold group-hover:text-brand-700 transition">{title}</h3>
        <p className="text-gray-600 mt-1">{desc}</p>
        <div className="mt-4 text-brand-700 font-medium group-hover:underline">Open →</div>
      </div>
    </div>
  </Link>
);

export default function Landing() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold">Create Videos with Ease</h1>
        <p className="text-gray-600 mt-3">
          Choose a creation mode. Configure backgrounds, voices, fonts, and preview instantly with Remotion.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          to="/reddit"
          title="Reddit Story Video"
          emoji="🧵"
          desc="Paste a Reddit link, pick background & voice, and generate a clean narration video."
          gradient="bg-gradient-to-r from-pink-500 to-rose-500"
        />
        <Card
          to="/storytelling"
          title="Storytelling Video"
          emoji="📖"
          desc="Write or generate a story with AI, then style and preview your narrative."
          gradient="bg-gradient-to-r from-indigo-500 to-violet-500"
        />
        <Card
          to="/informative"
          title="Informative Video"
          emoji="🧠"
          desc="Pick topics, auto-generate trivia, and turn facts into engaging shorts."
          gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
        <Card
          to="/QuoteSpotlight"
          title="Quote Spotlight"
          emoji="🧠"
          desc="Pick topics, auto-generate trivia, and turn facts into engaging shorts."
          gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>
    </div>
  );
}
