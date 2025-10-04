import React from 'react';
import { DIFFICULTY_COLORS } from '../utils/constants';

const RecommendListPopup = ({ recommendList, selectedGameInfo, selectedTable, onSelectGameInfo, onRecommendFromList, onClose, gamesManager }) => {
  if (!selectedTable) return null;

  const getGameInfo = (gameName) => {
    if (!gamesManager) return null;
    return gamesManager.getGameInfo(gameName);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border-2 border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⭐ 추천 리스트
            <span className="text-sm opacity-80">테이블 {selectedTable}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 게임 목록 (아코디언) */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
          {recommendList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-4">🎲</p>
              <p className="text-lg">추천 리스트가 비어있습니다</p>
              <p className="text-sm mt-2">게임 옆의 ⭐ 버튼을 눌러 추가하세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recommendList.map((game, idx) => {
                const gameInfo = getGameInfo(game.name);
                const isExpanded = selectedGameInfo && selectedGameInfo.name === game.name;

                return (
                  <div key={idx} className="border border-white/10 rounded-lg overflow-hidden">
                    {/* 게임 칩 (클릭 가능) */}
                    <button
                      onClick={() => onSelectGameInfo(game)}
                      className={`
                        w-full bg-gradient-to-r ${DIFFICULTY_COLORS[game.difficulty]}
                        px-4 py-3 text-left font-medium
                        transition-all duration-200
                        hover:brightness-110
                        ${isExpanded ? 'brightness-125' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{game.icon || '🎲'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{game.name}</span>
                              <span className="text-xs opacity-75">난이도 {game.difficulty}</span>
                            </div>
                            {game.recommendCount > 0 && (
                              <span className="text-xs opacity-75">추천 {game.recommendCount}회</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xl transition-transform duration-200" style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* 확장된 게임 정보 카드 (아코디언) */}
                    {isExpanded && gameInfo && (
                      <div
                        className="bg-gray-800/50 p-4 animate-slide-down"
                        style={{
                          animation: 'slideDown 0.2s ease-out'
                        }}
                      >
                        {/* 게임 설명 */}
                        <p className="text-sm text-gray-300 mb-3">{gameInfo.description}</p>

                        {/* 상세 정보 그리드 */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="bg-white/5 rounded px-2 py-1">
                            <span className="text-gray-400">장르:</span> <span className="font-bold">{gameInfo.genre}</span>
                          </div>
                          <div className="bg-white/5 rounded px-2 py-1">
                            <span className="text-gray-400">인원:</span> <span className="font-bold">{gameInfo.playerCount}명</span>
                          </div>
                          <div className="bg-white/5 rounded px-2 py-1">
                            <span className="text-gray-400">시간:</span> <span className="font-bold">{gameInfo.playTime}분</span>
                          </div>
                          <div className="bg-white/5 rounded px-2 py-1">
                            <span className="text-gray-400">출시:</span> <span className="font-bold">{gameInfo.releaseYear}</span>
                          </div>
                        </div>

                        {/* 전략 팁 */}
                        {gameInfo.strategies && (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
                            <p className="text-xs text-blue-300">
                              <span className="font-bold">💡 팁:</span> {gameInfo.strategies}
                            </p>
                          </div>
                        )}

                        {/* 추천하기 버튼 */}
                        <button
                          onClick={() => onRecommendFromList(game)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          🎯 테이블 {selectedTable}에 추천하기
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-gray-800/50 p-3 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            💡 게임을 클릭하면 상세 정보가 표시됩니다
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendListPopup;
