'use client';

import { useEffect, useRef } from 'react';
import { Topic, CountryCode } from '@/types/game';
import { TOPICS, COUNTRIES } from '@/lib/gameUtils';
import Logo from './Logo';
import { Title } from '@/lib/titles';

interface Props {
  currentTopic: Topic;
  currentCountry: CountryCode;
  isDaily: boolean;
  titleProgress: { title: Title; nextTitle: Title | null; perfectGames: number } | null;
  onSelectTopic: (t: Topic) => void;
  onSelectCountry: (c: CountryCode) => void;
  onGoDaily: () => void;
}

export default function GameNav({
  currentTopic, currentCountry, isDaily, titleProgress,
  onSelectTopic, onSelectCountry, onGoDaily,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Arrow key navigation for the country slider
  useEffect(() => {
    function smoothScroll(container: HTMLElement, to: number, duration = 260) {
      const from = container.scrollLeft;
      const delta = to - from;
      if (Math.abs(delta) < 1) return;
      const start = performance.now();
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        container.scrollLeft = from + delta * easeOutCubic(t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); // stop browser from natively scrolling the focused overflow container
      const currentIndex = COUNTRIES.findIndex((c) => c.code === currentCountry);
      const next = e.key === 'ArrowRight'
        ? Math.min(currentIndex + 1, COUNTRIES.length - 1)
        : Math.max(currentIndex - 1, 0);
      if (next === currentIndex) return;

      // 1. Update selection immediately (feels instant)
      onSelectCountry(COUNTRIES[next].code);

      // 2. Smooth-scroll only if the target flag isn't fully visible
      //    Use offsetLeft (container-relative, stable after trackpad scroll)
      const container = scrollRef.current;
      if (!container) return;
      const buttons = container.querySelectorAll('button');
      const btn = buttons[next] as HTMLElement | undefined;
      if (!btn) return;
      const pad = 20;
      const cRect = container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      // Convert viewport-relative → scroll-content-relative (stable after trackpad scroll)
      const btnLeft = bRect.left - cRect.left + container.scrollLeft;
      const btnRight = btnLeft + btn.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      if (btnLeft < scrollLeft + pad) {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        smoothScroll(container, btnLeft - pad);
      } else if (btnRight > scrollLeft + containerWidth - pad) {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        smoothScroll(container, btnRight - containerWidth + pad);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentCountry, onSelectCountry]);

  return (
    <header className="backdrop-blur-md bg-white/5 border-b border-white/10">
      <div className="max-w-2xl mx-auto px-6 pt-7 pb-5 flex flex-col items-center gap-5">

        {/* Logo + title badge */}
        <div className="flex flex-col items-center gap-1.5">
          <Logo />
          {titleProgress && (
            <span className="text-[11px] text-white/40 font-medium tracking-wide">
              {titleProgress.title.name} · {titleProgress.perfectGames} perfect
            </span>
          )}
        </div>

        {/* Topic tabs + Daily */}
        <div className="flex gap-2 flex-wrap justify-center">
          {TOPICS.map((t) => {
            const active = currentTopic === t.id && !isDaily;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTopic(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'text-white/45 hover:text-white/75 hover:bg-white/10'
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}

          <button
            onClick={onGoDaily}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              isDaily
                ? 'bg-white/25 text-white shadow-sm'
                : 'text-white/45 hover:text-white/75 hover:bg-white/10'
            }`}
          >
            <span>🔥</span>
            <span>Daily</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-white/10" />

        {/* Country flags — horizontal scroll, arrow-key navigable */}
        <div ref={scrollRef} className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-5 w-max mx-auto pb-1 px-2">
            {COUNTRIES.map((c) => {
              const active = currentCountry === c.code && !isDaily;
              return (
                <button
                  key={c.code}
                  onClick={() => onSelectCountry(c.code)}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer transition-opacity flex-shrink-0 ${
                    active ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                  }`}
                >
                  <span className={`text-4xl leading-none ${active ? 'drop-shadow-lg' : ''}`}>
                    {c.flag}
                  </span>
                  <span className={`text-xs font-semibold tracking-wide ${active ? 'text-white' : 'text-white/50'}`}>
                    {c.code === 'global' ? 'Global' : c.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}
