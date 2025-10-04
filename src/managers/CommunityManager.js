import Papa from 'papaparse';

class CommunityManager {
  constructor() {
    this.newsPool = []; // CSV에서 로드한 전체 뉴스 데이터
    this.currentNews = []; // 현재 주차 뉴스
    this.trendingGames = new Set(); // 트렌딩 게임 목록
    this.currentWeek = 0;
    this.isLoaded = false;
  }

  // CSV 파일에서 커뮤니티 뉴스 로드
  async loadCommunityNews() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/community-news.csv`);
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.newsPool = results.data;
            this.isLoaded = true;
            console.log('📰 커뮤니티 뉴스 로드 완료:', this.newsPool.length, '개');
            resolve(this.newsPool);
          },
          error: (error) => {
            console.error('❌ 커뮤니티 뉴스 CSV 로드 실패:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ CSV 파일 fetch 실패:', error);
      throw error;
    }
  }

  // 주차별 뉴스 가져오기
  getNewsForWeek(week) {
    const newsForWeek = this.newsPool.filter(n => n.week === week);

    if (newsForWeek.length === 0) {
      // 주차에 해당하는 뉴스가 없으면 순환
      const cycledWeek = ((week - 1) % this.newsPool.length) + 1;
      return this.newsPool.filter(n => n.week === cycledWeek);
    }

    return newsForWeek;
  }

  // 주차별 트렌딩 게임 업데이트
  updateTrendingGames(week) {
    this.currentWeek = week;
    this.currentNews = this.getNewsForWeek(week);
    this.trendingGames.clear();

    this.currentNews.forEach(news => {
      if (news.trendingGames && news.trendingGames.trim() !== '') {
        const games = news.trendingGames.split(',').map(g => g.trim());
        games.forEach(game => this.trendingGames.add(game));
      }
    });

    console.log('🔥 Week', week, '트렌딩 게임:', Array.from(this.trendingGames));
    return Array.from(this.trendingGames);
  }

  // 트렌딩 게임 여부 확인
  isTrendingGame(gameName) {
    return this.trendingGames.has(gameName);
  }

  // 현재 트렌딩 게임 목록
  getTrendingGames() {
    return Array.from(this.trendingGames);
  }

  // 현재 주차 뉴스 가져오기
  getCurrentNews() {
    return [...this.currentNews];
  }

  // 뉴스 타입별 효과 반환
  getNewsEffect(newsType) {
    const effectMap = {
      party_boost: { type: 'boost', genre: 'party', value: 15 },
      strategy_boost: { type: 'boost', genre: 'strategy', value: 15 },
      coop_penalty: { type: 'penalty', genre: 'coop', value: -10 },
      beginner_boost: { type: 'boost', difficulty: 1, value: 20 },
      detective_boost: { type: 'boost', genre: 'detective', value: 15 },
      classic_boost: { type: 'boost', multiplier: 1.1 },
      heavy_penalty: { type: 'penalty', difficulty: 4, value: -15 },
      family_boost: { type: 'boost', genre: 'family', value: 15 },
      tournament_boost: { type: 'boost', genre: 'tournament', value: 10 },
      deckbuilding_boost: { type: 'boost', genre: 'deckbuilding', value: 15 },
      aesthetic_boost: { type: 'boost', specific: true, value: 10 },
      werewolf_penalty: { type: 'penalty', genre: 'werewolf', value: -10 },
      coop_boost: { type: 'boost', genre: 'coop', value: 20 },
      trade_boost: { type: 'boost', trade: true, value: 10 },
      streaming_boost: { type: 'boost', popularity: true, value: 15 },
      abstract_boost: { type: 'boost', genre: 'abstract', value: 10 },
      satisfaction_maintain: { type: 'maintain', value: 0 },
      event_boost: { type: 'boost', event: true, value: 10 },
      new_game_interest: { type: 'boost', newGame: true, value: 10 },
      crowdfunding_boost: { type: 'boost', purchase: true, value: 5 }
    };

    return effectMap[newsType] || { type: 'none', value: 0 };
  }

  // 중요도별 별 표시
  getImportanceStars(importance) {
    switch (importance) {
      case 'high':
        return '⭐⭐⭐';
      case 'medium':
        return '⭐⭐';
      case 'low':
        return '⭐';
      default:
        return '';
    }
  }

  // 특정 게임이 이번 주 뉴스에 언급되었는지 확인
  isGameMentioned(gameName) {
    return this.currentNews.some(news => {
      if (!news.trendingGames) return false;
      const games = news.trendingGames.split(',').map(g => g.trim());
      return games.includes(gameName);
    });
  }
}

export default CommunityManager;
