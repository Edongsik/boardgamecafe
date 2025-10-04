import Papa from 'papaparse';

class GamesManager {
  constructor() {
    this.gamesPool = []; // CSV에서 로드한 전체 게임 데이터
    this.purchasableGamesPool = []; // 구매 가능한 게임 목록
    this.ownedGames = []; // 현재 보유 중인 게임
    this.isLoaded = false;
  }

  // CSV 파일에서 게임 풀 로드
  async loadGamesPool() {
    try {
      const gamesResponse = await fetch('/data/games-pool.csv');
      const gamesCsvText = await gamesResponse.text();

      const purchasableResponse = await fetch('/data/purchasable-games.csv');
      const purchasableCsvText = await purchasableResponse.text();

      const gamesPromise = new Promise((resolve, reject) => {
        Papa.parse(gamesCsvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.gamesPool = results.data;
            console.log('🎮 게임 풀 로드 완료:', this.gamesPool.length, '개');
            resolve(this.gamesPool);
          },
          error: (error) => {
            console.error('❌ 게임 CSV 로드 실패:', error);
            reject(error);
          }
        });
      });

      const purchasablePromise = new Promise((resolve, reject) => {
        Papa.parse(purchasableCsvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.purchasableGamesPool = results.data;
            console.log('🛒 구매 가능 게임 로드 완료:', this.purchasableGamesPool.length, '개');
            resolve(this.purchasableGamesPool);
          },
          error: (error) => {
            console.error('❌ 구매 게임 CSV 로드 실패:', error);
            reject(error);
          }
        });
      });

      await Promise.all([gamesPromise, purchasablePromise]);

      // 초기 게임 설정 (initial: true인 게임들)
      const initialGames = this.gamesPool.filter(g => g.initial === true);
      this.ownedGames = initialGames.map(g => ({
        name: g.name,
        difficulty: g.difficulty,
        genre: g.genre,
        icon: g.icon,
        originalPrice: g.price || 30000,
        tradeValue: Math.floor((g.price || 30000) * 0.5),
        recommendCount: 0,
        acquiredDay: 0
      }));

      this.isLoaded = true;
      console.log('✅ 초기 게임 설정 완료:', this.ownedGames.length, '개');

      return { gamesPool: this.gamesPool, purchasableGames: this.purchasableGamesPool };
    } catch (error) {
      console.error('❌ CSV 파일 fetch 실패:', error);
      throw error;
    }
  }

  // 게임 상세 정보 가져오기
  getGameInfo(gameName) {
    const game = this.gamesPool.find(g => g.name === gameName);
    return game || null;
  }

  // 난이도별 게임 필터
  getGamesByDifficulty(difficulty) {
    return this.gamesPool.filter(g => g.difficulty === difficulty);
  }

  // 장르별 게임 필터
  getGamesByGenre(genre) {
    return this.gamesPool.filter(g => g.genre === genre);
  }

  // 조건 충족한 구매 가능 게임만 반환
  getUnlockedPurchasableGames(gameState) {
    return this.purchasableGamesPool.filter(game => {
      // 이미 보유한 게임은 제외
      if (this.hasGame(game.name)) {
        return false;
      }

      // 잠금 해제 조건 확인
      switch (game.unlockCondition) {
        case 'always':
          return true;
        case 'day':
          return gameState.day >= game.unlockValue;
        case 'visitors':
          return gameState.totalVisitors >= game.unlockValue;
        case 'rating':
          return gameState.satisfaction >= game.unlockValue;
        case 'regulars':
          return gameState.regulars >= game.unlockValue;
        default:
          return true;
      }
    });
  }

  // 보유 게임 목록
  getOwnedGames() {
    return [...this.ownedGames];
  }

  // 중복 제거한 보유 게임 목록
  getUniqueOwnedGames() {
    return this.ownedGames.filter((game, index, self) =>
      index === self.findIndex(g => g.name === game.name)
    );
  }

  // 게임 추가
  addGame(game, currentDay = 0) {
    // 게임 풀에서 상세 정보 가져오기
    const gameInfo = this.getGameInfo(game.name);

    if (gameInfo) {
      this.ownedGames.push({
        name: gameInfo.name,
        difficulty: gameInfo.difficulty,
        genre: gameInfo.genre,
        icon: gameInfo.icon,
        originalPrice: gameInfo.price || 30000,
        tradeValue: Math.floor((gameInfo.price || 30000) * 0.5),
        recommendCount: 0,
        acquiredDay: currentDay
      });
      console.log('✅ 게임 추가:', gameInfo.name);
    } else {
      // 풀에 없는 게임이면 기본 정보로 추가
      this.ownedGames.push({
        name: game.name,
        difficulty: game.difficulty || 2,
        genre: game.genre || '기타',
        icon: game.icon || '🎲',
        originalPrice: 30000,
        tradeValue: 15000,
        recommendCount: 0,
        acquiredDay: currentDay
      });
      console.log('⚠️ 게임 정보 없이 추가:', game.name);
    }
  }

  // 게임 제거
  removeGame(gameName) {
    this.ownedGames = this.ownedGames.filter(g => g.name !== gameName);
    console.log('🗑️ 게임 제거:', gameName);
  }

  // 게임 보유 여부 확인
  hasGame(gameName) {
    return this.ownedGames.some(g => g.name === gameName);
  }

  // 랜덤 게임 가져오기
  getRandomGame() {
    if (this.ownedGames.length === 0) return null;
    return this.ownedGames[Math.floor(Math.random() * this.ownedGames.length)];
  }

  // 랜덤 게임 제거
  removeRandomGame() {
    if (this.ownedGames.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.ownedGames.length);
    const removedGame = this.ownedGames[randomIndex];
    this.ownedGames.splice(randomIndex, 1);
    console.log('📉 유행 종료:', removedGame.name);
    return removedGame.name;
  }

  // 구매 가능한 게임 목록 (조건 포함)
  getPurchasableGames(gameState) {
    const unlockedGames = this.getUnlockedPurchasableGames(gameState);

    // 게임 풀에서 상세 정보 병합
    return unlockedGames.map(pg => {
      const fullInfo = this.getGameInfo(pg.name);
      return {
        ...pg,
        ...fullInfo
      };
    });
  }

  // 인기도별 게임 필터
  getGamesByPopularity(popularity) {
    return this.gamesPool.filter(g => g.popularity === popularity);
  }

  // 플레이어 수에 맞는 게임 추천
  getGamesByPlayerCount(playerCount) {
    return this.gamesPool.filter(g => {
      const [min, max] = g.playerCount.split('-').map(Number);
      return playerCount >= min && playerCount <= max;
    });
  }

  // 플레이 시간에 맞는 게임 추천
  getGamesByPlayTime(maxTime) {
    return this.gamesPool.filter(g => g.playTime <= maxTime);
  }

  // 🆕 추천 카운트 증가
  incrementRecommendCount(gameName) {
    const game = this.ownedGames.find(g => g.name === gameName);
    if (game) {
      game.recommendCount = (game.recommendCount || 0) + 1;
      console.log(`📈 ${gameName} 추천 횟수: ${game.recommendCount}`);
    }
  }

  // 🆕 가장 많이 추천된 게임 찾기
  getMostRecommendedGame() {
    if (this.ownedGames.length <= 2) {
      console.log('⚠️ 게임이 2개 이하이므로 폐기하지 않습니다.');
      return null;
    }

    const mostUsed = this.ownedGames.reduce((max, game) =>
      (game.recommendCount || 0) > (max.recommendCount || 0) ? game : max
    );

    // 최소 10회 이상 추천된 게임만 폐기 대상
    if (mostUsed.recommendCount < 10) {
      console.log('⚠️ 가장 많이 사용된 게임도 10회 미만이므로 폐기하지 않습니다.');
      return null;
    }

    return mostUsed;
  }

  // 🆕 게임의 중고 가치 가져오기
  getTradeValue(gameName) {
    const game = this.ownedGames.find(g => g.name === gameName);
    return game?.tradeValue || 0;
  }

  // 🆕 여러 게임의 총 중고 가치 계산
  calculateTotalTradeValue(gameNames) {
    return gameNames.reduce((total, name) => {
      const game = this.ownedGames.find(g => g.name === name);
      return total + (game?.tradeValue || 0);
    }, 0);
  }

  // 🆕 중고거래 실행
  tradeGames(oldGameNames, newGameName, currentDay = 0) {
    const totalValue = this.calculateTotalTradeValue(oldGameNames);
    const newGameInfo = this.getGameInfo(newGameName);

    if (!newGameInfo) {
      return { success: false, error: '게임을 찾을 수 없습니다' };
    }

    const targetPrice = newGameInfo.price || 30000;
    const shortfall = targetPrice - totalValue;

    // 기존 게임들 제거
    oldGameNames.forEach(name => this.removeGame(name));

    // 새 게임 추가
    this.addGame({ name: newGameName }, currentDay);

    console.log('🔄 중고거래 완료:', oldGameNames.join(', '), '→', newGameName);

    return {
      success: true,
      shortfall: Math.max(0, shortfall),
      oldGames: oldGameNames,
      newGame: newGameName,
      totalValue,
      targetPrice
    };
  }

  // 🆕 중고거래 가능한 게임 목록 (추천 횟수 5회 이상)
  getTradableGames() {
    return this.ownedGames.filter(g => (g.recommendCount || 0) >= 5);
  }
}

export default GamesManager;
