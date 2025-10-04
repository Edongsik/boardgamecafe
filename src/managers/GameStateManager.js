class GameStateManager {
  constructor() {
    this.state = {
      gameState: 'playing',
      day: 1,
      revenue: 0,
      satisfaction: 20,
      regulars: 1,
      totalVisitors: 0,
      funds: 4000000,
      gameSpeed: 1,
      lastEventDay: 0,
      previousSatisfaction: 20,
      selectedTable: null,
      successfulRecommendations: 0,
      weeklyGameIndex: 0,
      regularCustomerBonus: 0,
      regularCustomerBonusDays: 0,
      regularCustomerPenalty: 0,
      regularCustomerPenaltyDays: 0,
      lastRegularInfoDay: 0,
      lastVisitorMilestone: 0,
      satisfactionBonus: 0,
    };
  }
  
  getState() {
    return { ...this.state };
  }
  
  updateState(updates) {
    this.state = { ...this.state, ...updates };
  }
  
  get(key) {
    return this.state[key];
  }
  
  set(key, value) {
    this.state[key] = value;
  }
}

export default GameStateManager;