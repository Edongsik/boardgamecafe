import React, { useState } from 'react';
import { DIFFICULTY_COLORS } from '../utils/constants';

const TradeGamesModalContent = ({ ownedGames, availablePurchases, gamesManager, onTradeGames, onClose }) => {
  const [selectedGames, setSelectedGames] = useState([]);
  const [targetGame, setTargetGame] = useState(null);

  const toggleGameSelection = (gameName) => {
    setSelectedGames(prev =>
      prev.includes(gameName)
        ? prev.filter(g => g !== gameName)
        : [...prev, gameName]
    );
  };

  const totalTradeValue = gamesManager?.calculateTotalTradeValue(selectedGames) || 0;
  const targetPrice = targetGame?.price || 0;
  const difference = targetPrice - totalTradeValue;
  const canAfford = difference <= 0 || true; // 자금 체크는 handleTradeGames에서 수행

  const handleTrade = () => {
    if (selectedGames.length === 0) {
      alert('교환할 게임을 선택하세요!');
      return;
    }
    if (!targetGame) {
      alert('받을 게임을 선택하세요!');
      return;
    }
    onTradeGames(selectedGames, targetGame);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* 왼쪽: 내가 가진 게임 */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="font-bold text-lg mb-3 text-yellow-400">📤 교환할 게임 선택</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {ownedGames && ownedGames.length > 0 ? (
              ownedGames.map((game, idx) => {
                const isSelected = selectedGames.includes(game.name);
                const gameInfo = gamesManager?.getGameInfo(game.name);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleGameSelection(game.name)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      <span className="text-xl">{game.icon || '🎲'}</span>
                      <span className="font-bold">{game.name}</span>
                      {game.recommendCount >= 10 && (
                        <span className="text-red-400 text-xs">⚠️ 낡음</span>
                      )}
                    </div>
                    <div className="text-xs space-y-1 ml-6">
                      <div className="flex justify-between">
                        <span className="text-gray-400">원가:</span>
                        <span>₩{(game.originalPrice || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">중고가:</span>
                        <span className="text-yellow-400 font-bold">₩{(game.tradeValue || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">추천 횟수:</span>
                        <span>{game.recommendCount || 0}회</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center">보유한 게임이 없습니다</p>
            )}
          </div>

          {/* 선택한 게임 총 가치 */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="font-bold">선택한 게임 총 가치:</span>
              <span className="text-xl font-bold text-yellow-400">
                ₩{totalTradeValue.toLocaleString()}
              </span>
            </div>
            {selectedGames.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                선택: {selectedGames.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* 오른쪽: 구매 가능한 게임 */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="font-bold text-lg mb-3 text-blue-400">📥 받을 게임 선택</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availablePurchases && availablePurchases.length > 0 ? (
              availablePurchases.map((game, idx) => {
                const isSelected = targetGame?.name === game.name;
                const canExchange = totalTradeValue >= game.price;

                return (
                  <div
                    key={idx}
                    onClick={() => setTargetGame(game)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                      }
                      ${!canExchange && selectedGames.length > 0 ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{game.icon || '🎲'}</span>
                      <span className="font-bold">{game.name}</span>
                      {canExchange && selectedGames.length > 0 && (
                        <span className="text-green-400 text-xs">✓ 교환 가능</span>
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-gray-300">{game.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${DIFFICULTY_COLORS[game.difficulty]}`}>
                          난이도: {game.difficulty}
                        </span>
                        <span className="font-bold text-blue-400">₩{game.price.toLocaleString()}</span>
                      </div>
                      {game.specialTag && (
                        <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs mt-1">
                          {game.specialTag}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center">구매 가능한 게임이 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 하단: 거래 정보 및 버튼 */}
      {targetGame && selectedGames.length > 0 && (
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">선택한 게임 총 가치</p>
              <p className="text-xl font-bold text-yellow-400">₩{totalTradeValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">목표 게임 가격</p>
              <p className="text-xl font-bold text-blue-400">₩{targetPrice.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">{difference > 0 ? '부족 금액' : '거스름돈'}</p>
              <p className={`text-xl font-bold ${difference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                ₩{Math.abs(difference).toLocaleString()}
              </p>
            </div>
          </div>

          {difference > 0 && (
            <p className="text-sm text-yellow-400 text-center mb-3">
              💡 부족한 금액은 보유 자금에서 차감됩니다
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleTrade}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              🔄 교환하기
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {(!targetGame || selectedGames.length === 0) && (
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-400">
            {selectedGames.length === 0
              ? '왼쪽에서 교환할 게임을 선택하세요'
              : '오른쪽에서 받을 게임을 선택하세요'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TradeGamesModalContent;
