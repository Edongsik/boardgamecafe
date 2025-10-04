import React from 'react';
import { TEXTS } from '../data/textData';
import { formatNumber } from '../utils/formatters';

const GamePurchaseModalContent = ({ availablePurchases, onPurchaseGame }) => {
  return (
    <div>
      <p className="text-gray-300 mb-6">{TEXTS.modals.gamePurchase.description}</p>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {availablePurchases.map((game, idx) => (
          <button 
            key={idx} 
            onClick={() => onPurchaseGame(game)} 
            className="w-full text-left p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="flex justify-between items-center font-bold">
              <span>🎲 {game.name}</span>
              <span>₩{formatNumber(game.cost)}</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">{game.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GamePurchaseModalContent;