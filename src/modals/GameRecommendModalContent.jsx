import React from 'react';
import { DIFFICULTY_COLORS } from '../utils/constants';

const GameRecommendModalContent = ({ recommendList, selectedTable, gamesManager, onRecommend }) => {
  // undefined 또는 빈 배열 처리
  if (!recommendList || recommendList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">🎲</p>
        <p className="text-yellow-400 text-lg mb-2">추천 게임 목록이 비어있습니다.</p>
        <p className="text-sm text-gray-400">
          '⭐ 추천게임 바꾸기' 버튼을 눌러 게임을 추가하세요.
        </p>
      </div>
    );
  }

  const getGameInfo = (gameName) => {
    if (!gamesManager) return null;
    return gamesManager.getGameInfo(gameName);
  };

  return (
    <div className="space-y-4">
      {/* 상단 안내 */}
      <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-3 text-center">
        <p className="text-lg font-bold">
          📋 테이블 {selectedTable}에 추천할 게임을 선택하세요
        </p>
        <p className="text-sm text-gray-300 mt-1">
          게임을 클릭하면 바로 추천이 진행됩니다
        </p>
      </div>

      {/* 추천 리스트 */}
      <div className="space-y-3">
        {recommendList.map((game, idx) => {
          const gameInfo = getGameInfo(game.name);

          return (
            <button
              key={idx}
              onClick={() => onRecommend(game)}
              className={`
                w-full bg-gradient-to-r ${DIFFICULTY_COLORS[game.difficulty]}
                p-4 rounded-lg font-medium
                transition-all duration-200
                hover:scale-105 hover:shadow-xl
                border-2 border-white/20 hover:border-white/40
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.icon || '🎲'}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{game.name}</span>
                    <span className="text-sm opacity-75">난이도 {game.difficulty}</span>
                  </div>
                  {gameInfo && (
                    <p className="text-xs opacity-75 mt-1">
                      {gameInfo.genre} · {gameInfo.playerCount}명 · {gameInfo.playTime}분
                    </p>
                  )}
                  {game.recommendCount > 0 && (
                    <p className="text-xs opacity-75 mt-1">
                      추천 {game.recommendCount}회
                    </p>
                  )}
                </div>
                <div className="text-2xl">➡️</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 힌트 */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-xs text-gray-400 text-center">
          💡 손님의 수준과 게임 난이도가 맞을수록 성공률이 높아집니다
        </p>
      </div>
    </div>
  );
};

export default GameRecommendModalContent;
