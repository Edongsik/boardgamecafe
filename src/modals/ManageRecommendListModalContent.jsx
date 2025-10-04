import React, { useState, useEffect } from 'react';
import { DIFFICULTY_COLORS } from '../utils/constants';

const ManageRecommendListModalContent = ({ currentRecommendList, ownedGames, gamesManager, onSave, onClose }) => {
  const [selectedGames, setSelectedGames] = useState([]);

  useEffect(() => {
    // 초기값: 현재 추천 리스트
    setSelectedGames(currentRecommendList.map(g => g.name));
  }, [currentRecommendList]);

  const toggleGame = (gameName) => {
    setSelectedGames(prev => {
      if (prev.includes(gameName)) {
        return prev.filter(n => n !== gameName);
      } else {
        if (prev.length >= 5) {
          return prev; // 5개 초과 방지
        }
        return [...prev, gameName];
      }
    });
  };

  const handleSave = () => {
    const selectedGameObjects = ownedGames.filter(g => selectedGames.includes(g.name));
    onSave(selectedGameObjects);
  };

  const getGameInfo = (gameName) => {
    if (!gamesManager) return null;
    return gamesManager.getGameInfo(gameName);
  };

  return (
    <div className="space-y-4">
      {/* 상단: 현재 추천 목록 */}
      <div>
        <h3 className="text-lg font-bold mb-2">📌 현재 추천 리스트 ({selectedGames.length}/5)</h3>
        {selectedGames.length > 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-3 flex flex-wrap gap-2">
            {selectedGames.map((gameName, idx) => {
              const game = ownedGames.find(g => g.name === gameName);
              if (!game) return null;

              return (
                <div
                  key={idx}
                  className={`bg-gradient-to-r ${DIFFICULTY_COLORS[game.difficulty]} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2`}
                >
                  <span>{game.icon || '🎲'}</span>
                  <span>{game.name}</span>
                  <button
                    onClick={() => toggleGame(gameName)}
                    className="text-white hover:text-red-300 font-bold"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">추천 리스트가 비어있습니다</p>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-white/10"></div>

      {/* 하단: 보유 게임 목록 (체크박스) */}
      <div>
        <h3 className="text-lg font-bold mb-2">🎲 보유 게임 선택</h3>
        <div className="bg-gray-800/30 rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
          {ownedGames.map((game, idx) => {
            const isSelected = selectedGames.includes(game.name);
            const gameInfo = getGameInfo(game.name);
            const canSelect = isSelected || selectedGames.length < 5;

            return (
              <label
                key={idx}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-yellow-600/30 border-2 border-yellow-400'
                    : canSelect
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 border-2 border-transparent'
                      : 'bg-gray-800/30 opacity-50 cursor-not-allowed border-2 border-transparent'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => canSelect && toggleGame(game.name)}
                  disabled={!canSelect}
                  className="w-5 h-5 accent-yellow-500"
                />
                <div className={`flex-1 bg-gradient-to-r ${DIFFICULTY_COLORS[game.difficulty]} px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2`}>
                  <span className="text-xl">{game.icon || '🎲'}</span>
                  <span>{game.name}</span>
                  <span className="text-xs opacity-75">(난이도 {game.difficulty})</span>
                  {game.recommendCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-black/30 rounded-full text-xs">
                      추천 {game.recommendCount}회
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="text-center">
        {selectedGames.length === 0 && (
          <p className="text-red-400 text-sm">
            ⚠️ 최소 1개 이상 선택해야 합니다
          </p>
        )}
        {selectedGames.length === 5 && (
          <p className="text-yellow-400 text-sm">
            ⚠️ 최대 5개까지 선택할 수 있습니다
          </p>
        )}
        {selectedGames.length > 0 && selectedGames.length < 5 && (
          <p className="text-gray-400 text-sm">
            추천 목록: {selectedGames.length}/5
          </p>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={selectedGames.length < 1 || selectedGames.length > 5}
          className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all ${
            selectedGames.length >= 1 && selectedGames.length <= 5
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          💾 저장 ({selectedGames.length}개)
        </button>
      </div>
    </div>
  );
};

export default ManageRecommendListModalContent;
