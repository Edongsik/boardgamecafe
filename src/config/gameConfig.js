// src/config/gameConfig.js

// 게임 기본 설정
export const GAME_CONFIG = {
  INITIAL_FUNDS: 4000000,
  INITIAL_SATISFACTION: 20,
  INITIAL_REGULARS: 1,
};

// 시간 및 속도 설정
export const TIME_CONFIG = {
  GAME_LOOP_INTERVAL: 1000, // 1초마다 게임 상태 업데이트
  DAY_LOOP_INTERVAL: 2500,   // 2.5초마다 하루 진행
  GAME_SPEED_MULTIPLIER: 2,
};

// 수입 및 비용 설정
export const ECONOMY_CONFIG = {
  REVENUE_PER_TICK_PER_TABLE: 10000,
  MONTHLY_MAINTENANCE_COST: 1000000,
  EVENT_COSTS: {
    sns: 200000,
    tournament: 500000,
    discount: 100000,
  },
};

// 이벤트 효과 및 확률 설정
export const EVENT_EFFECTS = {
  AI_ACCEPT_REVENUE_BONUS: 80000,
  AI_ACCEPT_VISITOR_BONUS: 3,
  AI_REJECT_SATISFACTION_PENALTY: 15,
  TOURNAMENT_SUCCESS_REVENUE_BONUS: 300000,
  // ... 다른 이벤트 효과들도 추가할 수 있습니다.
};