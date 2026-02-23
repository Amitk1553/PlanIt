import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { historyApi } from '@/lib/api';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyApi
      .list(50)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await historyApi.remove(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // silent
    }
  };

  const handleRerun = (item) => {
    const params = new URLSearchParams({
      prompt: item.prompt,
      city: item.city,
      state: item.state,
      country: item.country,
      date: item.date,
    });
    navigate(`/results?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-forest-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(20,70,60,0.5),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(15,80,80,0.3),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 border-b border-white/8 px-6 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-lg font-semibold tracking-tight">Search History</span>
      </header>

      <main className="relative z-10 flex-1 px-4 py-6 md:px-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Clock className="h-10 w-10 text-white/20" />
            <p className="text-sm text-white/40">No search history yet. Start exploring!</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-4 rounded-xl border border-white/8 bg-forest-900/60 px-5 py-4 transition hover:border-white/15 hover:bg-forest-800/60"
              >
                <button
                  onClick={() => handleRerun(item)}
                  className="flex flex-1 flex-col gap-1 text-left"
                >
                  <p className="text-sm font-medium text-white group-hover:text-teal-300">
                    {item.prompt}
                  </p>
                  <p className="text-xs text-white/40">
                    {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                    {item.date ? ` · ${item.date}` : ''}
                  </p>
                  <p className="text-[10px] text-white/25">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-red-500/20 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
