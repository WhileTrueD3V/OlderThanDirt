'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GameEvent, Topic, CountryCode } from '@/types/game';
import { sortByYear, calculateScore, formatYear, getScoreMessage } from '@/lib/gameUtils';
import { recordDailyCompletion } from '@/lib/streak';

interface Props {
  events: GameEvent[];
  topic?: Topic;
  country?: CountryCode;
  isDaily?: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onGameComplete?: () => void;
}

export default function GameBoard({ events, isDaily, onPlayAgain, onGoHome, onGameComplete }: Props) {
  const [items, setItems] = useState<GameEvent[]>(events);
  const [submitted, setSubmitted] = useState(false);
  const [finalStreak, setFinalStreak] = useState<number | null>(null);
  const [correctOrder] = useState<GameEvent[]>(() => sortByYear(events));
  const [pressedId, setPressedId] = useState<string | null>(null);

  const score = submitted ? calculateScore(items, correctOrder) : 0;

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || submitted) return;
      const reordered = [...items];
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      setItems(reordered);
    },
    [items, submitted]
  );

  function handleSubmit() {
    setSubmitted(true);
    onGameComplete?.();
    if (isDaily) {
      const s = recordDailyCompletion();
      setFinalStreak(s);
    }
  }

  return (
    <div className="w-full">
      {/* Score banner */}
      {submitted && (
        <div
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
        </div>
      )}

      {/* EARLIEST divider */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 border-t border-dashed border-white/20" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Earliest</span>
        <div className="flex-1 border-t border-dashed border-white/20" />
      </div>

      {/* Cards */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="game-board">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
              {items.map((event, index) => {
                const correctPos = submitted ? correctOrder.findIndex((e) => e.id === event.id) : -1;
                const isCorrect = submitted && correctPos === index;
                const isWrong = submitted && correctPos !== index;

                return (
                  <Draggable key={event.id} draggableId={event.id} index={index} isDragDisabled={submitted}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseDown={() => !submitted && setPressedId(event.id)}
                        onMouseUp={() => setPressedId(null)}
                        onMouseLeave={() => setPressedId(null)}
                        style={{
                          ...provided.draggableProps.style,
                          transitionDuration: snapshot.isDropAnimating ? '0.001s' : undefined,
                          transform: (pressedId === event.id || snapshot.isDragging)
                            ? `${provided.draggableProps.style?.transform ?? ''} scale(0.96)`
                            : provided.draggableProps.style?.transform,
                        }}
                        className={`
                          flex items-center gap-3 rounded-2xl border p-3.5 transition-colors duration-100 select-none
                          ${snapshot.isDragging ? 'bg-white/25 border-white/40 shadow-2xl shadow-black/20'
                            : isCorrect ? 'bg-teal-300/15 border-teal-300/30'
                            : isWrong ? 'bg-red-300/10 border-red-200/20'
                            : 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25'}
                          ${!submitted && !snapshot.isDragging ? 'cursor-grab active:cursor-grabbing' : ''}
                        `}
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
                            <div className="flex flex-col gap-[5px] px-1">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="w-3.5 h-[2px] bg-white/25 rounded-full" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
        <div className="flex flex-col items-center gap-3">
          {finalStreak !== null && (
            <div className="text-center py-3">
              <div className="text-4xl mb-1">🔥</div>
              <div className="text-white font-bold text-lg">{finalStreak} day streak!</div>
              <div className="text-white/40 text-sm mt-1">Come back tomorrow to keep it going.</div>
            </div>
          )}
          <button
            onClick={onGoHome}
            className="w-full py-4 backdrop-blur-md bg-white/15 hover:bg-white/22 border border-white/25 text-white font-semibold text-base rounded-2xl transition-all active:scale-95 cursor-pointer"
          >
            Play more puzzles
          </button>
        </div>
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
