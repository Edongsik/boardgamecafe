// src/modals/GameRecommendModalContent.jsx

import React from 'react';
import { TEXTS } from '../data/textData';
import { DIFFICULTY_TEXT_COLORS } from '../utils/constants';

const GameRecommendModalContent = ({ availableGames, onRecommendGame, selectedTableId }) => {
  return (
    <div>
      <p className="text-gray-300 mb-6">{TEXTS.modals.gameRecommend.description(selectedTableId)}</p>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {availableGames.length > 0 ? (
          availableGames.map((game, idx) => {
            const difficultyStars = '★'.repeat(game.difficulty) + '☆'.repeat(5 - game.difficulty);
            
            return (
              <button
                key={idx}
                onClick={() => onRecommendGame(game)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 py-3 rounded-xl font-bold transition-all text-left px-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span>🎲 {game.name}</span>
                  <span className="text-sm opacity-80">{TEXTS.modals.gameRecommend.buttonText}</span>
                </div>
                <div className={`text-xs ${DIFFICULTY_TEXT_COLORS[game.difficulty]}`}>
                  난이도: {difficultyStars} ({game.difficulty}/5)
                </div>
              </button>
            );
          })
        ) : (
          <p className="text-center text-gray-400 py-4">추천할 다른 게임이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default GameRecommendModalContent;