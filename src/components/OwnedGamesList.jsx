import React, { useState } from 'react';
import { TEXTS } from '../data/textData';
import { DIFFICULTY_COLORS } from '../utils/constants';

const GameTooltip = ({ game, gameInfo }) => {
  if (!gameInfo) return null;

  return (
    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-gray-900 border-2 border-white/20 rounded-xl p-4 shadow-2xl pointer-events-none">
      {/* 게임 헤더 */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
        <span className="text-3xl">{gameInfo.icon || '🎲'}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{gameInfo.name}</h3>
          <p className="text-xs text-gray-400">{gameInfo.publisher} · {gameInfo.releaseYear}</p>
        </div>
      </div>

      {/* 게임 정보 */}
      <p className="text-sm text-gray-300 mb-3">{gameInfo.description}</p>

      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-white/5 rounded px-2 py-1">
          <span className="text-gray-400">난이도:</span> <span className="font-bold">{gameInfo.difficulty}/5</span>
        </div>
        <div className="bg-white/5 rounded px-2 py-1">
          <span className="text-gray-400">장르:</span> <span className="font-bold">{gameInfo.genre}</span>
        </div>
        <div className="bg-white/5 rounded px-2 py-1">
          <span className="text-gray-400">인원:</span> <span className="font-bold">{gameInfo.playerCount}명</span>
        </div>
        <div className="bg-white/5 rounded px-2 py-1">
          <span className="text-gray-400">시간:</span> <span className="font-bold">{gameInfo.playTime}분</span>
        </div>
      </div>

      {/* 전략 팁 */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-2">
        <p className="text-xs text-blue-300">
          <span className="font-bold">💡 팁:</span> {gameInfo.strategies}
        </p>
      </div>

      {/* Fun Fact */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2">
        <p className="text-xs text-purple-300">
          <span className="font-bold">✨ Fun Fact:</span> {gameInfo.funFact}
        </p>
      </div>

      {/* 삼각형 화살표 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900"></div>
    </div>
  );
};

const OwnedGamesList = ({ games, selectedTable, onGameClick, gamesManager, onOpenTrade, recommendList, onOpenManageRecommendList }) => {
  const hasSelectedTable = selectedTable !== null && selectedTable !== undefined;
  const [hoveredGame, setHoveredGame] = useState(null);

  const getGameInfo = (gameName) => {
    if (!gamesManager) return null;
    return gamesManager.getGameInfo(gameName);
  };

  const getMostRecommendedCount = () => {
    if (!games || games.length === 0) return 0;
    return Math.max(...games.map(g => g.recommendCount || 0));
  };

  const mostRecommendedCount = getMostRecommendedCount();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">🎲 보유 게임 목록 ({games.length}개)</h2>
          {recommendList && recommendList.length > 0 && (
            <p className="text-sm text-yellow-400 mt-1">
              ⭐ 추천 리스트: {recommendList.length}/5개 등록됨
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenTrade}
            className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            🔄 중고거래
          </button>
          <button
            onClick={onOpenManageRecommendList}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            ⭐ 추천게임 바꾸기
          </button>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mb-3 text-center">
        {hasSelectedTable ? (
          <p className="text-sm text-green-400 font-medium">
            💡 테이블 {selectedTable}에 추천할 게임을 선택하세요 (호버하면 상세 정보 표시)
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            💡 먼저 손님이 있는 테이블을 선택하세요
          </p>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        {games.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {games.map((game, idx) => {
              const gameInfo = getGameInfo(game.name);

              const isWornOut = game.recommendCount === mostRecommendedCount && mostRecommendedCount >= 10;
              const isInRecommendList = recommendList && recommendList.some(g => g.name === game.name);

              return (
                <div key={idx} className="relative">
                  <button
                    onMouseEnter={() => setHoveredGame(game.name)}
                    onMouseLeave={() => setHoveredGame(null)}
                    className={`
                      bg-gradient-to-r ${DIFFICULTY_COLORS[game.difficulty]}
                      px-3 py-2 rounded-full text-sm font-medium
                      transition-all duration-200 flex items-center gap-1 relative
                      ${isWornOut ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900' : ''}
                      ${isInRecommendList ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    <span>{game.icon || '🎲'}</span>
                    <span>{game.name}</span>
                    <span className="text-xs opacity-75">({game.difficulty})</span>

                    {/* 추천 횟수 뱃지 */}
                    {game.recommendCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-black/30 rounded-full text-xs">
                        {game.recommendCount}회
                      </span>
                    )}

                    {/* 낡음 표시 */}
                    {isWornOut && (
                      <span className="absolute -top-1 -right-1 text-xs">⚠️</span>
                    )}

                    {/* 추천 리스트 포함 표시 */}
                    {isInRecommendList && (
                      <span className="ml-1 text-yellow-400">⭐</span>
                    )}
                  </button>

                  {/* 툴팁 */}
                  {hoveredGame === game.name && gameInfo && (
                    <GameTooltip game={game} gameInfo={gameInfo} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">아직 보유한 게임이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default OwnedGamesList;
