import React from 'react';

const BuffCard = ({ buff, currentDay }) => {
  const getCategoryColor = (category) => {
    switch(category) {
      case 'positive': return 'bg-green-500/20 border-green-500/50 text-green-200';
      case 'negative': return 'bg-red-500/20 border-red-500/50 text-red-200';
      default: return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'community': return '📰';
      case 'regular': return '👥';
      case 'milestone': return '🎯';
      case 'rating': return '⭐';
      default: return '💫';
    }
  };

  const remainingDays = buff.expiryDay === -1 ? -1 : buff.expiryDay - currentDay;

  return (
    <div className={`rounded-lg p-3 border-2 ${getCategoryColor(buff.category)} transition-all hover:scale-105`}>
      <div className="flex items-start gap-2">
        <span className="text-2xl">{buff.icon || getTypeIcon(buff.type)}</span>
        <div className="flex-1">
          <div className="font-bold text-sm">{buff.name}</div>
          <div className="text-xs opacity-80 mt-1">{buff.description}</div>
          <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
            {buff.value !== 0 && (
              <span className="px-2 py-0.5 bg-black/20 rounded">
                {buff.value > 0 ? '+' : ''}{buff.value}%
              </span>
            )}
            {remainingDays === -1 ? (
              <span className="px-2 py-0.5 bg-purple-500/30 rounded">
                ♾️ 영구
              </span>
            ) : (
              <span className="opacity-60">
                ⏰ {remainingDays}일 남음
              </span>
            )}
            <span className="px-2 py-0.5 bg-black/30 rounded text-xs">
              {getTypeIcon(buff.type)} {buff.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveBuffsDisplay = ({ buffs, currentDay }) => {
  const positiveBuffs = buffs.filter(b => b.category === 'positive');
  const negativeBuffs = buffs.filter(b => b.category === 'negative');
  const neutralBuffs = buffs.filter(b => b.category === 'neutral');

  if (buffs.length === 0) {
    return null; // 버프가 없으면 컴포넌트 자체를 숨김
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        💫 활성 효과
        <span className="text-sm font-normal text-gray-400">
          ({buffs.length}개)
        </span>
      </h3>

      <div className="space-y-4">
        {positiveBuffs.length > 0 && (
          <div>
            <div className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
              ✅ 긍정 효과 ({positiveBuffs.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {positiveBuffs.map(buff => (
                <BuffCard key={buff.id} buff={buff} currentDay={currentDay} />
              ))}
            </div>
          </div>
        )}

        {negativeBuffs.length > 0 && (
          <div>
            <div className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
              ⚠️ 부정 효과 ({negativeBuffs.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {negativeBuffs.map(buff => (
                <BuffCard key={buff.id} buff={buff} currentDay={currentDay} />
              ))}
            </div>
          </div>
        )}

        {neutralBuffs.length > 0 && (
          <div>
            <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
              ℹ️ 정보 ({neutralBuffs.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {neutralBuffs.map(buff => (
                <BuffCard key={buff.id} buff={buff} currentDay={currentDay} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBuffsDisplay;
