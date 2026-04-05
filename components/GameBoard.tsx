'use client';

import { useState } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GameEvent, Topic, CountryCode } from '@/types/game';
import { sortByYear, calculateScore, formatYear, getScoreMessage } from '@/lib/gameUtils';

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

  return (
    <Reorder.Item
      value={event}
      dragListener={false}
      dragControls={controls}
      dragElastic={0.08}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
      whileDrag={{ scale: 0.97, boxShadow: '0 16px 40px rgba(0,0,0,0.25)', zIndex: 50 }}
      whileTap={submitted ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
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
        if (!submitted) controls.start(e);
      }}
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

export default function GameBoard({ events, isDaily, onPlayAgain, onGoHome, onGameComplete }: Props) {
  const [items, setItems] = useState<GameEvent[]>(events);
  const [submitted, setSubmitted] = useState(false);
  const [correctOrder] = useState<GameEvent[]>(() => sortByYear(events));

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
          <div>
            <div className="font-semibold text-white">{getScoreMessage(score)}</div>
            <div className="text-sm text-white/45 mt-0.5">
              {score === 5 ? 'All 5 in the right order' : `${score} card${score === 1 ? '' : 's'} in the correct position`}
            </div>
          </div>
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
    </div>
  );
}
