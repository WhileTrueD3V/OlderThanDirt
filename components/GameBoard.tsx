'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GameEvent, Topic, CountryCode } from '@/types/game';
import { sortByYear, calculateScore, formatYear, getScoreMessage, getCountryLabel, getTopicLabel } from '@/lib/gameUtils';

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

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || submitted) return;
    const reordered = [...items];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setItems(reordered);
  }, [items, submitted]);

  function handleSubmit() {
    setSubmitted(true);
  }

  function handlePlayAgain() {
    router.refresh();
  }

  function handleHome() {
    router.push('/');
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header badge */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
          {getTopicLabel(topic)}
        </span>
        <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
          {getCountryLabel(country)}
        </span>
      </div>

      {/* Instruction */}
      {!submitted && (
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          Drag the cards into order — <strong className="text-gray-700">oldest at the top, newest at the bottom.</strong>
        </p>
      )}

      {/* Score banner */}
      {submitted && (
        <div
          className={`rounded-2xl p-5 mb-6 flex items-center gap-4 ${
            score === 5
              ? 'bg-green-50 border border-green-200'
              : score >= 3
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className={`text-4xl font-black ${
            score === 5 ? 'text-green-600' : score >= 3 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {score}/5
          </div>
          <div>
            <div className="font-semibold text-gray-900">{getScoreMessage(score)}</div>
            <div className="text-sm text-gray-500 mt-0.5">
              {score === 5
                ? 'All 5 in the right order'
                : `${score} card${score === 1 ? '' : 's'} in the correct position`}
            </div>
          </div>
        </div>
      )}

      {/* Drag-and-drop list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="game-board">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-3"
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
                          rounded-2xl border-2 bg-white p-4 flex items-start gap-4 transition-all duration-150 select-none
                          ${snapshot.isDragging ? 'shadow-2xl scale-[1.02] border-orange-400' : 'shadow-sm'}
                          ${isCorrect ? 'border-green-400 bg-green-50' : ''}
                          ${isWrong ? 'border-red-300 bg-red-50' : ''}
                          ${!submitted && !snapshot.isDragging ? 'border-gray-200 cursor-grab active:cursor-grabbing hover:border-orange-300 hover:shadow-md' : ''}
                        `}
                      >
                        {/* Position number */}
                        <div
                          className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5
                            ${isCorrect ? 'bg-green-500 text-white' : ''}
                            ${isWrong ? 'bg-red-400 text-white' : ''}
                            ${!submitted ? 'bg-gray-100 text-gray-500' : ''}
                          `}
                        >
                          {submitted ? (isCorrect ? '✓' : '✗') : index + 1}
                        </div>

                        {/* Emoji */}
                        <div className="text-2xl flex-shrink-0 mt-0.5">{event.emoji}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 leading-snug">{event.title}</div>
                          <div className="text-sm text-gray-500 mt-1 leading-snug">{event.description}</div>

                          {/* Year reveal */}
                          {submitted && (
                            <div
                              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold
                                ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                              `}
                            >
                              {formatYear(event.year)}
                            </div>
                          )}
                        </div>

                        {/* Drag handle indicator (hidden after submit) */}
                        {!submitted && (
                          <div className="flex-shrink-0 flex flex-col gap-1 mt-2">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="w-4 h-0.5 bg-gray-300 rounded-full" />
                            ))}
                          </div>
                        )}

                        {/* Correct year position hint after submit */}
                        {submitted && isWrong && (
                          <div className="flex-shrink-0 text-xs text-gray-400 text-right">
                            <div>Should be</div>
                            <div className="font-semibold text-gray-600">#{correctPos + 1}</div>
                          </div>
                        )}
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

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="flex-1 sm:flex-none px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 cursor-pointer"
          >
            Lock in my order →
          </button>
        ) : (
          <>
            <button
              onClick={handlePlayAgain}
              className="flex-1 sm:flex-none px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 cursor-pointer"
            >
              Play again
            </button>
            <button
              onClick={handleHome}
              className="flex-1 sm:flex-none px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-lg rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all active:scale-95 cursor-pointer"
            >
              Change topic
            </button>
          </>
        )}
      </div>
    </div>
  );
}
