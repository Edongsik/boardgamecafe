import { reviewTemplates, getRandomTemplate } from '../data/reviewTemplates';

class ReviewsManager {
  constructor() {
    this.reviews = [];
    this.nextId = 1;
  }

  generateReview(currentDay, satisfaction, context = {}) {
    const rating = satisfaction / 10; // 0~10 점수로 변환
    let comment = '';
    let type = '';
    let customerType = context.customerType || 'visitor';

    // 평점 구간 결정
    if (rating >= 8) {
      type = 'positive';
      comment = getRandomTemplate(reviewTemplates.positive);
    } else if (rating >= 5) {
      type = 'neutral';
      comment = getRandomTemplate(reviewTemplates.neutral);
    } else {
      type = 'negative';
      comment = getRandomTemplate(reviewTemplates.negative);
    }

    // 상황별 리뷰 추가 (50% 확률)
    if (Math.random() < 0.5) {
      if (context.isFullHouse) {
        comment = getRandomTemplate(reviewTemplates.fullHouse);
        type = 'neutral';
      } else if (context.hasUnhappyTables) {
        comment = getRandomTemplate(reviewTemplates.unhappyTables);
        type = 'negative';
      } else if (context.hasNewGame) {
        comment = getRandomTemplate(reviewTemplates.newGame);
        type = 'positive';
      } else if (context.afterEvent) {
        comment = getRandomTemplate(reviewTemplates.event);
        type = 'positive';
      } else if (context.isRegular) {
        comment = getRandomTemplate(reviewTemplates.regular);
        type = 'positive';
        customerType = 'regular';
      }
    }

    const review = {
      id: this.nextId++,
      rating: Math.round(rating * 10) / 10, // 소수점 첫째자리까지
      comment: comment,
      type: type,
      day: currentDay,
      customerType: customerType
    };

    this.reviews.push(review);

    // 최대 50개까지만 보관 (메모리 관리)
    if (this.reviews.length > 50) {
      this.reviews.shift();
    }

    return review;
  }

  getRecentReviews(n = 15) {
    return [...this.reviews].reverse().slice(0, n);
  }

  getAverageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  getReviewCount() {
    return this.reviews.length;
  }

  getReviewsByType(type) {
    return this.reviews.filter(review => review.type === type);
  }

  clearOldReviews(dayThreshold) {
    this.reviews = this.reviews.filter(review => review.day >= dayThreshold);
  }
}

export default ReviewsManager;
