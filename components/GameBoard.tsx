'use client';

import { useState } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GameEvent, Topic, CountryCode } from '@/types/game';
import { sortByYear, calculateScore, formatYear, getScoreMessage, TOPICS, COUNTRIES } from '@/lib/gameUtils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'olderthandirt.vercel.app';

function buildShareText(
  items: GameEvent[],
  correctOrder: GameEvent[],
  score: number,
  topic: Topic | undefined,
  country: CountryCode | undefined,
  isDaily: boolean,
): string {
  const grid = items
    .map((e, i) => (correctOrder[i].id === e.id ? '🟩' : '🟥'))
    .join('');

  const topicInfo = TOPICS.find((t) => t.id === topic);
  const countryInfo = COUNTRIES.find((c) => c.code === country);

  const label = isDaily
    ? `Daily · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
    : [topicInfo?.label, countryInfo?.code !== 'global' ? countryInfo?.name : 'Global']
        .filter(Boolean)
        .join(' · ');

  const scoreComment = score === 5
    ? "I got a perfect score 🏆 Can you beat it?"
    : score >= 3
    ? `I got ${score}/5 — think you can do better?`
    : `Only got ${score}/5 — this one's tough. Can you beat me?`;

  return `Check out my answer on OlderThanDirt!\n\n${label}\n${grid} ${score}/5\n\n${scoreComment}\n\nJOIN ME 👉 ${SITE_URL}`;
}

function ShareModal({
  items,
  correctOrder,
  score,
  topic,
  country,
  isDaily,
  onClose,
}: {
  items: GameEvent[];
  correctOrder: GameEvent[];
  score: number;
  topic: Topic | undefined;
  country: CountryCode | undefined;
  isDaily: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(items, correctOrder, score, topic, country, isDaily);
  const url = `https://${SITE_URL}`;

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareMessages() {
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  }

  // Preview: replace the JOIN ME line with a styled version
  const previewLines = text.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full max-w-sm bg-[#16162a] border border-white/10 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer text-sm"
        >
          ✕
        </button>

        <h2 className="text-white font-black text-lg mb-1">Share your result</h2>
        <p className="text-white/35 text-xs mb-5">Challenge your friends to beat your score</p>

        {/* Preview card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 font-mono text-sm leading-relaxed">
          {previewLines.map((line, i) => (
            <div key={i} className={
              line.startsWith('JOIN ME') ? 'text-violet-300 font-bold mt-1' :
              line.startsWith('Check out') ? 'text-white font-semibold' :
              line === '' ? 'h-2' :
              'text-white/55'
            }>
              {line || '\u00A0'}
            </div>
          ))}
        </div>

        {/* Share buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={copyText}
            className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/15 text-white font-semibold text-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            {copied ? '✓ Copied to clipboard!' : '📋 Copy to clipboard'}
          </button>
          <button
            onClick={shareMessages}
            className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/15 text-white font-semibold text-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            💬 Share on Messages
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface Props {
  events: GameEvent[];
  topic?: Topic;
  country?: CountryCode;
  isDaily?: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onGameComplete?: (score: number) => void;
}

function Card({
  event,
  submitted,
  isCorrect,
  isWrong,
  correctPos,
}: {
  event: GameEvent;
  submitted: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  correctPos: number;
}) {
  const controls = useDragControls();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Reorder.Item
      value={event}
      dragListener={false}
      dragControls={controls}
      dragElastic={0.08}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
      animate={{ scale: isPressed ? 0.96 : 1 }}
      transition={{
        layout: { duration: 0.15, ease: [0.2, 0, 0, 1] },
        scale: { type: 'spring', stiffness: 500, damping: 14 },
      }}
      style={{ zIndex: isPressed ? 50 : 'auto' as const }}
      className={`
        flex items-center gap-3 rounded-2xl border p-3.5 select-none
        ${submitted ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        ${isCorrect
          ? 'bg-teal-300/15 border-teal-300/30'
          : isWrong
          ? 'bg-red-300/10 border-red-200/20'
          : 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25'}
      `}
      onPointerDown={(e) => {
        if (submitted) return;
        setIsPressed(true);
        controls.start(e);
      }}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onDragEnd={() => setIsPressed(false)}
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl">
        {event.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm leading-snug">{event.title}</div>
        {submitted && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isCorrect ? 'bg-teal-300/20 text-teal-200' : 'bg-white/10 text-white/55'
            }`}>
              {formatYear(event.year)}
            </span>
            {isWrong && (
              <span className="text-xs text-white/35">→ should be #{correctPos + 1}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        {submitted ? (
          <span className={`text-base font-bold ${isCorrect ? 'text-teal-300' : 'text-red-300/70'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
        ) : (
          <div className="flex flex-col gap-[5px] px-1 touch-none">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3.5 h-[2px] bg-white/25 rounded-full" />
            ))}
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

export default function GameBoard({ events, topic, country, isDaily, onPlayAgain, onGoHome, onGameComplete }: Props) {
  const [items, setItems] = useState<GameEvent[]>(events);
  const [submitted, setSubmitted] = useState(false);
  const [correctOrder] = useState<GameEvent[]>(() => sortByYear(events));
  const [showShare, setShowShare] = useState(false);

  const score = submitted ? calculateScore(items, correctOrder) : 0;

  function handleSubmit() {
    const finalScore = calculateScore(items, correctOrder);
    setSubmitted(true);
    onGameComplete?.(finalScore);
  }

  return (
    <div className="w-full">
      {/* Score banner */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`backdrop-blur-md rounded-2xl p-4 mb-6 flex items-center gap-4 border ${
            score === 5
              ? 'bg-teal-300/15 border-teal-300/30'
              : score >= 3
              ? 'bg-amber-300/15 border-amber-300/30'
              : 'bg-red-300/10 border-red-300/20'
          }`}
        >
          <div className={`text-4xl font-black tabular-nums ${
            score === 5 ? 'text-teal-200' : score >= 3 ? 'text-amber-200' : 'text-red-200'
          }`}>
            {score}/5
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white">{getScoreMessage(score)}</div>
            <div className="text-sm text-white/45 mt-0.5">
              {score === 5 ? 'All 5 in the right order' : `${score} card${score === 1 ? '' : 's'} in the correct position`}
            </div>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            ↑ Share
          </button>
        </motion.div>
      )}

      {/* EARLIEST divider */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 border-t border-dashed border-white/20" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Earliest</span>
        <div className="flex-1 border-t border-dashed border-white/20" />
      </div>

      {/* Cards */}
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={submitted ? () => {} : setItems}
        className="flex flex-col gap-2"
        as="div"
      >
        {items.map((event, index) => {
          const correctPos = submitted ? correctOrder.findIndex((e) => e.id === event.id) : -1;
          const isCorrect = submitted && correctPos === index;
          const isWrong = submitted && correctPos !== index;
          return (
            <Card
              key={event.id}
              event={event}
              submitted={submitted}
              isCorrect={isCorrect}
              isWrong={isWrong}
              correctPos={correctPos}
            />
          );
        })}
      </Reorder.Group>

      {/* LATEST divider */}
      <div className="flex items-center gap-4 mt-4 mb-8">
        <div className="flex-1 border-t border-dashed border-white/20" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Latest</span>
        <div className="flex-1 border-t border-dashed border-white/20" />
      </div>

      {/* Buttons */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-4 backdrop-blur-md bg-white/15 hover:bg-white/22 border border-white/25 hover:border-white/40 text-white font-bold text-base rounded-2xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-black/10 tracking-wide"
        >
          Lock it in
        </button>
      ) : isDaily ? (
        <button
          onClick={onGoHome}
          className="w-full py-4 backdrop-blur-md bg-white/15 hover:bg-white/22 border border-white/25 text-white font-semibold text-base rounded-2xl transition-all active:scale-95 cursor-pointer"
        >
          Play more puzzles
        </button>
      ) : (
        <button
          onClick={onPlayAgain}
          className="w-full py-4 backdrop-blur-md bg-white/20 hover:bg-white/28 border border-white/30 text-white font-bold text-base rounded-2xl transition-all active:scale-95 cursor-pointer"
        >
          Play again
        </button>
      )}

      {/* Share modal */}
      {showShare && (
        <ShareModal
          items={items}
          correctOrder={correctOrder}
          score={score}
          topic={topic}
          country={country}
          isDaily={!!isDaily}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
