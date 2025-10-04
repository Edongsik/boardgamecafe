import React from 'react';
import { formatNumber } from '../utils/formatters';
import { TEXTS } from '../data/textData';

const StatCard = ({ label, value, icon, onClick, hoverText, badge }) => (
  <div
    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 ${onClick ? 'cursor-pointer hover:bg-white/20 transition-all' : ''} relative`}
    onClick={onClick}
  >
    {badge && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
    )}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {hoverText && <p className="text-xs text-yellow-300">{hoverText}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const StatsDisplay = ({ day, revenue, satisfaction, regulars, funds, totalVisitors, onPurchaseClick, onAddTableClick, onRegularsClick, onShowReviews, regularNewsBonus, regularNewsBonusDays, onDayClick, hasNewCommunityNews }) => {
  const rating = (satisfaction / 10).toFixed(1);

  const regularsHoverText = regularNewsBonus > 0
    ? `보너스: +${regularNewsBonus}% (${regularNewsBonusDays}일)`
    : '클릭하여 단골 뉴스 확인';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      <StatCard label={TEXTS.ui.day} value={day} icon="📅" onClick={onDayClick} hoverText="클릭하여 커뮤니티 소식 보기" badge={hasNewCommunityNews} />
      <StatCard label={TEXTS.ui.revenue} value={`₩${formatNumber(revenue)}`} icon="💰" onClick={onPurchaseClick} hoverText="클릭하여 게임 구매" />
      <StatCard label={TEXTS.ui.satisfaction} value={`${rating} / 10`} icon="⭐" onClick={onShowReviews} hoverText="클릭하여 리뷰 보기" />
      <StatCard label={TEXTS.ui.regulars} value={`${regulars}명`} icon="👥" onClick={onRegularsClick} hoverText={regularsHoverText} />
      <StatCard label={TEXTS.ui.funds} value={`₩${formatNumber(funds)}`} icon="🏦" onClick={onAddTableClick} hoverText="클릭하여 테이블 추가" />
      <StatCard label={TEXTS.ui.totalVisitors} value={`${totalVisitors}명`} icon="🚶‍♂️" />
    </div>
  );
};

// 이 파일의 기본 대표 선수는 StatsDisplay 라고 명시해주는 부분입니다.
export default StatsDisplay;

