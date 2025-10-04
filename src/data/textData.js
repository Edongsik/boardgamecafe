import { formatNumber } from '../utils/formatters';

export const TEXTS = {
  // --- 공통 UI 텍스트 ---
  header: {
    title: '🎲 보드게임 카페 경영 게임',
    subtitle: '당신의 보드게임 카페를 성공적으로 운영해보세요!',
  },
  ui: {
    day: 'Day',
    revenue: '매출',
    satisfaction: '평점', // ✨ 변경: '만족도' -> '평점'
    regulars: '단골손님',
    funds: '보유 자금',
    totalVisitors: '누적 방문자',
    tables: '🪑 테이블 현황',
    ownedGames: '🔥 인기 게임 목록',
    pause: '⏸️ 일시정지',
    resume: '▶️ 재개',
    speedUp: '⚡ 2배속',
    speedDown: '🐌 1배속',
    confirm: '확인',
    close: '닫기',
    cancel: '취소',
    tableRating: '만족도', // ✨ 변경: '평점' -> '만족도'
  },
  
  // --- 모달 관련 텍스트 ---
  modals: {
    aiRecommend: {
      title: '🎯 중요한 결정!',
      description: '새로운 주가 시작되었습니다. AI가 새로운 게임을 추천했습니다.',
      accept: '✅ AI 추천 수용',
      reject: '❌ 거절',
    },
    gamePurchase: {
      title: '🛒 게임 구매',
      description: '새로운 보드게임을 구매하여 카페를 업그레이드하세요!',
    },
    gameRecommend: {
      title: '🎮 게임 추천하기',
      description: (tableId) => `테이블 ${tableId}의 손님들에게 게임을 추천해보세요!`,
      buttonText: '추천하기',
    },
    eventSelection: {
      title: '🎪 이벤트 선택',
      description: '어떤 이벤트를 진행하시겠습니까?',
      sns: { title: 'SNS 홍보 이벤트', desc: (cost) => `비용: ₩${formatNumber(cost)} | 방문자 증가` },
      tournament: { title: '게임 대회 열기', desc: (cost) => `비용: ₩${formatNumber(cost)} | 만족도 & 매출 증가` },
      discount: { title: '할인 이벤트', desc: (cost) => `비용: ₩${formatNumber(cost)} | 대량 방문자 증가` },
    },
  },

  // --- 결과창 관련 텍스트 (동적 생성을 위해 함수 사용) ---
  results: {
    recommendSuccess: {
      title: '😊 게임 추천 성공!',
      content: (gameName) => `손님들이 ${gameName}을 좋아합니다!`,
    },
    recommendFailure: {
      title: '😞 게임 추천 실패',
      content: (gameName) => `손님들이 ${gameName}을 별로 좋아하지 않습니다.`,
    },
    recommendMaster: {
      title: '🎉 추천 마스터!',
      content: '3번 성공으로 보너스!\n만족도 +10%, 단골손님 +1명',
    },
    purchaseSuccess: {
      title: (gameName) => `🎉 ${gameName} 구매 완료!`,
      content: (visitorCount) => `새로운 게임이 입고되었습니다!\n호기심 많은 손님들이 ${visitorCount}명 방문했습니다.`,
    },
    insufficientFunds: {
      title: '💸 자금 부족',
      content: (target) => `${target}에 필요한 자금이 부족합니다.`,
    },
    monthlySettlement: {
      title: '📊 월말 정산 완료!',
      content: (revenue, cost) => `매출 +₩${formatNumber(revenue)}\n유지비 -₩${formatNumber(cost)}\n순수익: ₩${formatNumber(revenue - cost)}`,
    },
    aiAcceptSuccess: {
      title: (gameName) => `✅ ${gameName} 입고 완료!`,
      content: (visitors, revenue, difficulty) => `단기적으로 관심이 증가했습니다. +${visitors}명 방문, +${formatNumber(revenue)}원 매출\n난이도: ${difficulty}/5 (고난이도)`,
    },
    aiStruggle: {
      title: '⚠️ 테이블에서 어려움 호소',
      content: (gameName) => `손님들이 ${gameName}의 복잡한 룰에 당황하고 있습니다.`,
    },
    aiGiveUp: {
      title: '😞 게임 중도 포기',
      content: (gameName, satisfaction) => `손님들이 ${gameName}을 포기했습니다.\n만족도 -${satisfaction}%`,
    },
  },
};

