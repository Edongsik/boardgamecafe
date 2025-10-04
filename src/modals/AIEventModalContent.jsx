import React from 'react';
import { TEXTS } from '../data/textData';
import { formatNumber } from '../utils/formatters';

const AIEventModalContent = ({ game, onAccept, onReject }) => {
  return (
    <div>
      <p className="text-gray-300 mb-6">{TEXTS.modals.aiRecommend.description}</p>
      
      <div className="bg-white/10 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-lg mb-2">🤖 AI 추천: {game.name}</h4>
        <p className="text-sm text-gray-300 mb-2">• 비용: ₩{formatNumber(game.cost)} (3세트)</p>
        <p className="text-sm text-gray-300 mb-2">• 예상 효과: {game.description}</p>
        <p className="text-sm text-yellow-300">⚠️ {game.warning}</p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={onAccept}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-3 rounded-xl font-bold transition-all"
        >
          {TEXTS.modals.aiRecommend.accept}
        </button>
        <button 
          onClick={onReject}
          className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-3 rounded-xl font-bold transition-all"
        >
          {TEXTS.modals.aiRecommend.reject}
        </button>
      </div>
    </div>
  );
};

export default AIEventModalContent;

