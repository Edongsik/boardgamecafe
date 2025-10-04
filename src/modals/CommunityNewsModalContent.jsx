import React from 'react';

const CommunityNewsModalContent = ({ currentWeek, currentNews, ownedGames, communityManager }) => {
  // 현재 보유 중인 트렌딩 게임 필터링
  const ownedTrendingGames = ownedGames.filter(game =>
    communityManager.isTrendingGame(game.name)
  );

  return (
    <div className="space-y-4">
      {/* 뉴스 목록 */}
      <div className="space-y-3">
        {currentNews && currentNews.length > 0 ? (
          currentNews.map((news, idx) => {
            const stars = communityManager.getImportanceStars(news.importance);
            const trendingGamesList = news.trendingGames
              ? news.trendingGames.split(',').map(g => g.trim()).filter(g => g !== '')
              : [];

            return (
              <div
                key={idx}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{news.icon || '📰'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{news.title}</h3>
                      {stars && <span className="text-sm">{stars}</span>}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{news.content}</p>

                    {/* 트렌딩 게임 뱃지 */}
                    {trendingGamesList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {trendingGamesList.map((game, gameIdx) => (
                          <span
                            key={gameIdx}
                            className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-full text-xs font-bold text-orange-200"
                          >
                            🔥 {game}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>이번 주 커뮤니티 소식이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 보유 중인 트렌딩 게임 - 항상 표시 */}
      <div className={`rounded-lg p-4 border-2 ${
        ownedTrendingGames.length > 0
          ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/50'
          : 'bg-gray-900/30 border-gray-600/50'
      }`}>
        <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${
          ownedTrendingGames.length > 0 ? 'text-orange-200' : 'text-gray-400'
        }`}>
          🔥 보유 중인 트렌딩 게임
        </h3>

        {ownedTrendingGames.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {ownedTrendingGames.map((game, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-white/10 rounded-lg border border-orange-400/30"
                >
                  <span className="text-lg">{game.icon || '🎲'}</span>
                  <span className="ml-2 font-bold">{game.name}</span>
                </div>
              ))}
            </div>
            <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
              <p className="text-green-200 font-bold text-center">
                ✅ 평점 하락 방지 효과 적용 중!
              </p>
              <p className="text-xs text-green-300 text-center mt-1">
                트렌딩 게임을 보유하고 있어 평점이 하락하지 않습니다
              </p>
            </div>
          </>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-600/30">
            <p className="text-gray-400 text-center text-sm">
              ⚠️ 현재 트렌딩 게임을 보유하고 있지 않습니다
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              트렌딩 게임을 구매하면 평점 하락을 방지할 수 있습니다
            </p>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <p className="text-xs text-gray-400 text-center">
          💡 트렌딩 게임은 주차마다 변경되며, 보유 시 평점 하락을 방지합니다
        </p>
      </div>
    </div>
  );
};

export default CommunityNewsModalContent;
