'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GameEvent, Topic, CountryCode } from '@/types/game';
import { sortByYear, calculateScore, formatYear, getScoreMessage } from '@/lib/gameUtils';

interface Props {
  events: GameEvent[];
  topic: Topic;
  country: CountryCode;
}

export default function GameBoard({ events, topic, country }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<GameEvent[]>(events);
  const [submitted, setSubmitted] = useState(false);
  const [correctOrder] = useState<GameEvent[]>(() => sortByYear(events));

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

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Score banner */}
      {submitted && (
        <div
          className={`rounded-2xl p-4 mb-6 flex items-center gap-4 border ${
            score === 5
              ? 'bg-green-950/40 border-green-800'
              : score >= 3
              ? 'bg-amber-950/40 border-amber-800'
              : 'bg-red-950/40 border-red-900'
          }`}
        >
          <div
            className={`text-4xl font-black tabular-nums ${
              score === 5
                ? 'text-green-400'
                : score >= 3
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {score}/5
          </div>
          <div>
            <div className="font-semibold text-white">{getScoreMessage(score)}</div>
            <div className="text-sm text-[#666] mt-0.5">
              {score === 5
                ? 'All 5 in the right order'
                : `${score} card${score === 1 ? '' : 's'} in the correct position`}
            </div>
          </div>
        </div>
      )}

      {/* EARLIEST label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#2a2a2a]" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">
          Earliest
        </span>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Cards */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="game-board">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2"
            >
              {items.map((event, index) => {
                const correctPos = submitted
                  ? correctOrder.findIndex((e) => e.id === event.id)
                  : -1;
                const isCorrect = submitted && correctPos === index;
                const isWrong = submitted && correctPos !== index;

                return (
                  <Draggable
                    key={event.id}
                    draggableId={event.id}
                    index={index}
                    isDragDisabled={submitted}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          flex items-center gap-3 rounded-xl border p-3 transition-all duration-100 select-none
                          ${snapshot.isDragging
                            ? 'border-[#e8640c] bg-[#1c1c1c] shadow-2xl shadow-black/60 scale-[1.02]'
                            : isCorrect
                            ? 'border-green-700 bg-green-950/30'
                            : isWrong
                            ? 'border-red-900 bg-red-950/20'
                            : 'border-[#2a2a2a] bg-[#1c1c1c] hover:border-[#3a3a3a]'
                          }
                          ${!submitted && !snapshot.isDragging ? 'cursor-grab active:cursor-grabbing' : ''}
                        `}
                      >
                        {/* Emoji thumbnail */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#252525] flex items-center justify-center text-2xl">
                          {event.emoji}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm leading-snug">
                            {event.title}
                          </div>
                          {submitted && (
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  isCorrect
                                    ? 'bg-green-900/60 text-green-400'
                                    : 'bg-[#252525] text-[#888]'
                                }`}
                              >
                                {formatYear(event.year)}
                              </span>
                              {isWrong && (
                                <span className="text-xs text-[#555]">
                                  should be #{correctPos + 1}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right side: status or drag handle */}
                        <div className="flex-shrink-0">
                          {submitted ? (
                            <span className={`text-lg ${isCorrect ? 'text-green-400' : 'text-red-500'}`}>
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1 px-1">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="w-3.5 h-0.5 bg-[#3a3a3a] rounded-full" />
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

      {/* LATEST label */}
      <div className="flex items-center gap-3 mt-4 mb-8">
        <div className="flex-1 h-px bg-[#2a2a2a]" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">
          Latest
        </span>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Action buttons */}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          className="w-full py-4 bg-[#e8640c] hover:bg-[#d45a0a] text-white font-bold text-base rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#e8640c]/20"
        >
          Lock it in
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => router.refresh()}
            className="flex-1 py-4 bg-[#e8640c] hover:bg-[#d45a0a] text-white font-bold text-base rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            Play again
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-4 bg-[#1c1c1c] hover:bg-[#252525] text-white font-semibold text-base rounded-xl border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all active:scale-95 cursor-pointer"
          >
            Change topic
          </button>
        </div>
      )}
    </div>
  );
}
