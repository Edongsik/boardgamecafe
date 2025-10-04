import React from 'react';

const ReviewsModalContent = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400 text-lg">아직 리뷰가 없습니다.</p>
        <p className="text-gray-500 text-sm mt-2">손님들이 방문하면 리뷰가 쌓입니다!</p>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (rating >= 5) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getTypeIcon = (type) => {
    if (type === 'positive') return '😊';
    if (type === 'neutral') return '😐';
    return '😞';
  };

  const getCustomerTypeIcon = (customerType) => {
    if (customerType === 'regular') return '⭐';
    return '👤';
  };

  const getStarRating = (rating) => {
    const stars = rating / 2; // 10점 만점을 5점 만점으로 변환
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starDisplay = '';
    starDisplay += '⭐'.repeat(fullStars);
    if (hasHalfStar) starDisplay += '⭐';
    starDisplay += '☆'.repeat(emptyStars);

    return starDisplay;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 text-center mb-4">
        최근 {reviews.length}개의 리뷰
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(review.type)}</span>
                <span className="text-lg">{getCustomerTypeIcon(review.customerType)}</span>
                <div className={`px-3 py-1 rounded-full text-base font-bold border ${getRatingColor(review.rating)}`}>
                  {getStarRating(review.rating)}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Day {review.day}
              </div>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed">
              {review.comment}
            </p>

            {review.customerType === 'regular' && (
              <div className="mt-2 text-xs text-purple-400">
                ⭐ 단골손님 리뷰
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">😊</span>
            <span className="text-gray-400">긍정적 ({reviews.filter(r => r.type === 'positive').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">😐</span>
            <span className="text-gray-400">보통 ({reviews.filter(r => r.type === 'neutral').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">😞</span>
            <span className="text-gray-400">부정적 ({reviews.filter(r => r.type === 'negative').length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModalContent;
