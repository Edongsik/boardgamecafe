import React from 'react';
import { TEXTS } from '../data/textData';
import { formatNumber } from '../utils/formatters';

const GamePurchaseModalContent = ({ availablePurchases, onPurchaseGame, gamesManager }) => {
  return (
    <div>
      <p className="text-gray-300 mb-6">{TEXTS.modals.gamePurchase.description}</p>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {availablePurchases.map((game, idx) => {
          const isOwned = gamesManager && gamesManager.hasGame(game.name);

          return (
            <button
              key={idx}
              onClick={() => onPurchaseGame(game)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                isOwned
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex justify-between items-center font-bold">
                <span className="flex items-center gap-2">
                  🎲 {game.name}
                  {isOwned && <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">보유중</span>}
                </span>
                <span>₩{formatNumber(game.cost)}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">{game.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GamePurchaseModalContent;