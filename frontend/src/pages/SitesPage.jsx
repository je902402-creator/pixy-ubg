import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { categories, sites } from '../mock';
import SiteTile from '../components/SiteTile';
import ComingSoonModal from '../components/ComingSoonModal';
import StarField from '../components/StarField';

const SitesPage = () => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((s) => {
      const catMatch = active === 'all' || s.category === active;
      const qMatch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [query, active]);

  const handleTileClick = (site) => {
    if (site.url) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelected(site);
    setOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <StarField />

      <main className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8">
        {/* Title */}
        <h1
          className="text-center text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] sm:text-5xl md:text-6xl"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          Sites for school. <span className="text-white">:]</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/60 sm:text-base">
          A curated launchpad of unblocked apps, games, and tools for your school days.
        </p>

        {/* Search + Filters */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-stretch gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sites..."
              className="h-11 rounded-full border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:ring-white/30"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => {
              const isActive = active === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'border-white bg-white text-black'
                      : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <section className="mt-12">
          {filtered.length === 0 ? (
            <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
              No sites found. Try a different search or category.
            </div>
          ) : (
            <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((site) => (
                <SiteTile key={site.id} site={site} onClick={handleTileClick} />
              ))}
            </div>
          )}
        </section>

        {/* Footer note */}
        <p className="mt-16 text-center text-xs text-white/40">
          Made with ✨ for curious students. Click any tile to launch.
        </p>
      </main>

      <ComingSoonModal site={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default SitesPage;
