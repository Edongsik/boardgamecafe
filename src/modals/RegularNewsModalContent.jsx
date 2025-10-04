import React from 'react';

const RegularNewsModalContent = ({ newsData, onAccept, onReject }) => {
  if (!newsData) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-400">뉴스 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getRiskText = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return '낮음';
      case 'medium':
        return '보통';
      case 'high':
        return '높음';
      default:
        return '알 수 없음';
    }
  };

  const getNewsTypeIcon = (newsType) => {
    switch (newsType) {
      case 'game_trend':
        return '🎲';
      case 'competitor_info':
        return '🏢';
      case 'customer_preference':
        return '👥';
      case 'ai_warning':
        return '⚠️';
      case 'rare_game_info':
        return '💎';
      case 'event_idea':
        return '🎉';
      case 'market_trend':
        return '📈';
      case 'customer_mood':
        return '😊';
      default:
        return '📰';
    }
  };

  return (
    <div className="space-y-6">
      {/* 단골 프로필 */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{newsData.regularAvatar || '👤'}</span>
          <div>
            <h3 className="text-xl font-bold">{newsData.regularName}님</h3>
            <p className="text-sm text-gray-400">{newsData.personality} · 단골 손님</p>
          </div>
        </div>

        {/* 뉴스 타입 및 위험도 */}
        <div className="flex gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm">
            {getNewsTypeIcon(newsData.newsType)} {newsData.newsType}
          </span>
          <span className={`px-3 py-1 border rounded-full text-sm ${getRiskColor(newsData.riskLevel)}`}>
            위험도: {getRiskText(newsData.riskLevel)}
          </span>
        </div>

        {/* 뉴스 메시지 */}
        <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <p className="text-base leading-relaxed">{newsData.message}</p>
        </div>
      </div>

      {/* 예상 효과 */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-sm font-bold text-gray-400 mb-3">📊 예상 효과</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
            <span className="text-sm">✅ 수락 시</span>
            <span className="text-sm font-bold text-green-400">{newsData.acceptBenefit}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-500/10 rounded">
            <span className="text-sm">❌ 거절 시</span>
            <span className="text-sm text-gray-400">
              {newsData.rejectConsequence === '없음' ? '영향 없음' : newsData.rejectConsequence}
            </span>
          </div>
        </div>
      </div>

      {/* 보너스 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-400">보너스</p>
          <p className="text-2xl font-bold text-green-400">+{newsData.bonusValue}%</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-400">지속 시간</p>
          <p className="text-2xl font-bold text-purple-400">{newsData.duration}일</p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onAccept}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
        >
          ✅ 수락하기
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
        >
          ❌ 거절하기
        </button>
      </div>

      {/* 힌트 */}
      <div className="text-xs text-gray-400 text-center pt-2 border-t border-white/10">
        💡 힌트: 단골손님의 조언을 수락하면 특별한 보너스를 받을 수 있습니다!
        <br />
        위험도가 높을수록 큰 보상이 있지만, 거절 시 불이익도 있을 수 있습니다.
      </div>
    </div>
  );
};

export default RegularNewsModalContent;
