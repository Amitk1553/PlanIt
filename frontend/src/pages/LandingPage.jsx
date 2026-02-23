import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { MapPin, SendHorizonal, Plus, Compass, Utensils, Film, CloudSun, Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const suggestionCards = [
  { icon: <Compass className="h-5 w-5" />, label: 'Explore plans', color: 'text-teal-300' },
  { icon: <CloudSun className="h-5 w-5" />, label: 'Check weather', color: 'text-sage-300' },
  { icon: <Film className="h-5 w-5" />, label: 'Find movies', color: 'text-olive-300' },
  { icon: <Utensils className="h-5 w-5" />, label: 'Discover dining', color: 'text-amber-300' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pageRef = useRef(null);
  const menuRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.landing-animate',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' },
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setValidationError('');
    if (!prompt.trim()) return;

    const missing = [];
    if (!city.trim()) missing.push('City');
    if (!state.trim()) missing.push('State');
    if (!country.trim()) missing.push('Country');
    if (!date.trim()) missing.push('Date');

    if (missing.length) {
      setShowLocation(true);
      setValidationError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    const params = new URLSearchParams({
      prompt: prompt.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      date: date,
    });

    navigate(`/results?${params.toString()}`);
  };

  const handleSuggestionClick = (label) => {
    const prompts = {
      'Explore plans': 'Plan my Friday with brunch, a matinee, and sunset drinks.',
      'Check weather': 'What\'s the weather like today for an outdoor outing?',
      'Find movies': 'Find the best movies playing near me today.',
      'Discover dining': 'Suggest cozy restaurants for a dinner date tonight.',
    };
    setPrompt(prompts[label] || label);
  };

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen flex-col bg-forest-950"
    >
      {/* Background overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(20,70,60,0.5),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(15,80,80,0.3),transparent_50%)]" />
      </div>

      {/* Navbar */}
      <header className="landing-animate relative z-20 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-white">
            PlanIT
          </span>
          <svg className="h-3.5 w-3.5 text-white/50" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-600 text-sm font-semibold text-white transition hover:bg-olive-500"
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-forest-900/95 shadow-xl backdrop-blur-md">
              <div className="border-b border-white/5 px-4 py-3">
                <p className="truncate text-xs text-white/50">{user?.email}</p>
              </div>
              <Link
                to="/history"
                onClick={() => setShowProfileMenu(false)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <Clock className="h-4 w-4" />
                History
              </Link>
              <button
                onClick={() => { setShowProfileMenu(false); logout(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 transition hover:bg-white/5 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10">
        {/* Tagline */}
        <h1 className="landing-animate mb-10 max-w-xl text-center text-2xl font-normal leading-snug text-sage-200 md:text-3xl">
          Design your perfect outing without juggling ten tabs.
        </h1>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="landing-animate w-full max-w-2xl"
        >
          <div className="rounded-full px-4 py-2 border border-white/10 bg-forest-900/80 shadow-lg shadow-black/20 backdrop-blur-md transition focus-within:border-white/20">
            {/* Top row: prompt input */}
            <div className="flex items-center gap-2 px-5 py-3.5">
              <button
                type="button"
                onClick={() => setShowLocation(!showLocation)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/5 hover:text-white/80"
                title="Add location"
              >
                <Plus className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything"
                className="min-w-0 flex-1 bg-transparent text-base text-white placeholder-white/40 outline-none"
              />

              <button
                type="submit"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-forest-950 transition hover:bg-cream/90"
                title="Send"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </div>

            {/* Location row (collapsible) */}
            {showLocation && (
              <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-6 pb-3.5 pt-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-sage-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-24 flex-1 rounded bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <span className="text-white/20">,</span>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-24 flex-1 rounded bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <span className="text-white/20">,</span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="w-24 flex-1 rounded bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <span className="text-white/20">·</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-32 rounded bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          {validationError && (
            <p className="mt-2 text-center text-sm text-red-400">{validationError}</p>
          )}
        </form>

        {/* Suggestion cards */}
        <div className="landing-animate mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {suggestionCards.map((card) => (
            <button
              key={card.label}
              onClick={() => handleSuggestionClick(card.label)}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-white/8 bg-forest-900/50 px-5 py-4 text-left backdrop-blur transition hover:border-white/15 hover:bg-forest-800/60 sm:min-w-[150px]"
            >
              <span className={card.color}>{card.icon}</span>
              <span className="text-sm text-white/70 group-hover:text-white/90">
                {card.label}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
