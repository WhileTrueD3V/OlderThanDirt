import HomeSelector from '@/components/HomeSelector';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <span className="font-black text-xl tracking-tight text-gray-900">OlderThanDirt</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
            Timeline Game
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        <div className="mb-12">
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-none tracking-tight mb-4">
            Which came<br />
            <span className="text-orange-500">first?</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
            Sort 5 events into chronological order. Easier said than done.
          </p>
        </div>

        <HomeSelector />
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 mt-8 border-t border-gray-200">
        <p className="text-sm text-gray-400">
          OlderThanDirt — a timeline ordering game. How well do you know history?
        </p>
      </footer>
    </main>
  );
}
