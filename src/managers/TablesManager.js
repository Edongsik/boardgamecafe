class TablesManager {
  constructor() {
    this.tables = [
      { id: 1, occupied: false, game: null, satisfaction: 0, status: null, difficulty: 0, customerLevel: 0, turnsAtTable: 0 },
      { id: 2, occupied: false, game: null, satisfaction: 0, status: null, difficulty: 0, customerLevel: 0, turnsAtTable: 0 },
      { id: 3, occupied: false, game: null, satisfaction: 0, status: null, difficulty: 0, customerLevel: 0, turnsAtTable: 0 },
      { id: 4, occupied: false, game: null, satisfaction: 0, status: null, difficulty: 0, customerLevel: 0, turnsAtTable: 0 }
    ];
  }
  
  getTables() {
    return [...this.tables];
  }
  
  getTable(id) {
    return this.tables.find(t => t.id === id);
  }
  
  updateTable(id, updates) {
    const index = this.tables.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldTable = this.tables[index];
      const newTable = { ...oldTable, ...updates };

      // 만족도에 따라 상태(색상) 자동 업데이트
      if (updates.satisfaction !== undefined) {
        if (newTable.satisfaction >= 4) newTable.status = 'happy';
        else if (newTable.satisfaction >= 2) newTable.status = 'confused';
        else newTable.status = 'unhappy';
      }
      this.tables[index] = newTable;
    }
  }
  
  getOccupiedCount() {
    return this.tables.filter(t => t.occupied).length;
  }
  
  resetTable(id) {
    this.updateTable(id, {
      occupied: false,
      game: null,
      satisfaction: 0,
      status: null,
      difficulty: 0,
      customerLevel: 0,
      turnsAtTable: 0
    });
  }

  addTable() {
    const newTableId = this.tables.length + 1;
    if (this.tables.length >= 8) {
      return { success: false, message: '최대 8개까지만 테이블을 추가할 수 있습니다.' };
    }
    this.tables.push({
      id: newTableId,
      occupied: false, game: null, satisfaction: 0, status: null, difficulty: 0, customerLevel: 0, turnsAtTable: 0
    });
    return { success: true };
  }

  handleGameRecommendation(tableId, newGame, isSuccess) {
    const table = this.getTable(tableId);
    if (!table) return;

    if (isSuccess) {
      this.updateTable(tableId, { 
        game: newGame.name, 
        difficulty: newGame.difficulty,
        satisfaction: Math.min(5, table.satisfaction + 1) 
      });
    } else {
      this.updateTable(tableId, { 
        satisfaction: Math.max(1, table.satisfaction - 1) 
      });
    }
  }
  
  // ✨ 로직 이동: 테이블 순환 로직을 매니저로 가져옴
  simulateRandomTableEvent(gamesManager, satisfaction, regulars) {
    const tableIndex = Math.floor(Math.random() * this.tables.length);
    const table = this.tables[tableIndex];
    let didChange = false;
    let newVisitor = false;

    if (table.occupied) {
      // 기본 떠날 확률: 40%
      let leaveChance = 0.4;
      // 테이블 만족도 1점당 떠날 확률 7%씩 감소
      leaveChance -= (table.satisfaction / 5) * 0.35;
      // 최소 5% 확률로 떠남
      leaveChance = Math.max(0.05, leaveChance);

      if (Math.random() < leaveChance) {
        this.resetTable(table.id);
        didChange = true;
      }
    } else {
      // 기본 손님 도착 확률: 65%
      let arrivalChance = 0.65;
      // 전체 만족도와 단골손님 수에 따라 도착 확률 증가
      arrivalChance += (satisfaction / 100) * 0.20; // 만족도 100점이면 20%p 증가
      arrivalChance += (regulars / 50) * 0.15;      // 단골 50명이면 15%p 증가
      arrivalChance = Math.min(0.95, arrivalChance); // 최대 95% 확률

      if (Math.random() < arrivalChance) {
        const randomGame = gamesManager.getRandomGame();
        if (randomGame) {
          this.updateTable(table.id, {
            occupied: true,
            game: randomGame.name,
            difficulty: randomGame.difficulty,
            satisfaction: 2, // 기본 만족도 2
          });
          didChange = true;
          newVisitor = true;
        }
      }
    }
    return { didChange, newVisitor };
  }
}

export default TablesManager;

