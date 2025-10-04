import Papa from 'papaparse';

class RegularsManager {
  constructor() {
    this.regularsPool = []; // CSV에서 로드한 전체 단골 템플릿
    this.activeRegulars = []; // 현재 활성화된 단골 손님들
    this.newsTemplates = []; // 뉴스 템플릿
    this.activeNews = []; // 현재 활성화된 뉴스 보너스
    this.nextId = 1;
    this.nextNewsId = 1;
    this.isLoaded = false;
  }

  // CSV 파일에서 단골 손님 풀 로드
  async loadRegularsPool() {
    try {
      const poolResponse = await fetch(`${import.meta.env.BASE_URL}data/regulars-pool.csv`);
      const poolCsvText = await poolResponse.text();

      const newsResponse = await fetch(`${import.meta.env.BASE_URL}data/regular-news-templates.csv`);
      const newsCsvText = await newsResponse.text();

      const poolPromise = new Promise((resolve, reject) => {
        Papa.parse(poolCsvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.regularsPool = results.data;
            console.log('📊 단골손님 풀 로드 완료:', this.regularsPool.length, '명');
            resolve(this.regularsPool);
          },
          error: (error) => {
            console.error('❌ 단골손님 CSV 로드 실패:', error);
            reject(error);
          }
        });
      });

      const newsPromise = new Promise((resolve, reject) => {
        Papa.parse(newsCsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.newsTemplates = results.data;
            console.log('📰 뉴스 템플릿 로드 완료:', this.newsTemplates.length, '개');
            resolve(this.newsTemplates);
          },
          error: (error) => {
            console.error('❌ 뉴스 템플릿 CSV 로드 실패:', error);
            reject(error);
          }
        });
      });

      await Promise.all([poolPromise, newsPromise]);
      this.isLoaded = true;
      return { regularsPool: this.regularsPool, newsTemplates: this.newsTemplates };
    } catch (error) {
      console.error('❌ CSV 파일 fetch 실패:', error);
      throw error;
    }
  }

  // 풀에서 랜덤하게 단골 손님 추가
  addRandomRegular() {
    if (this.regularsPool.length === 0) {
      console.warn('⚠️ 단골손님 풀이 비어있습니다. CSV를 먼저 로드하세요.');
      return null;
    }

    // 이미 활성화되지 않은 템플릿 중에서 선택 (중복 방지)
    const usedTemplates = new Set(this.activeRegulars.map(r => r.name));
    const availableTemplates = this.regularsPool.filter(t => !usedTemplates.has(t.name));

    if (availableTemplates.length === 0) {
      // 모든 템플릿이 사용되었으면 전체 풀에서 선택
      console.log('ℹ️ 모든 단골 템플릿이 사용되어 재사용합니다.');
    }

    const templatePool = availableTemplates.length > 0 ? availableTemplates : this.regularsPool;
    const template = templatePool[Math.floor(Math.random() * templatePool.length)];

    const newRegular = {
      id: this.nextId++,
      name: template.name,
      personality: template.personality,
      favoriteGenre: template.favoriteGenre,
      abilityType: template.abilityType,
      abilityValue: template.abilityValue,
      description: template.description,
      avatar: template.avatar,
      newsType: template.newsType,
      newsFrequency: template.newsFrequency,
      newsBonusType: template.newsBonusType,
      newsBonusValue: template.newsBonusValue,
      newsDuration: template.newsDuration,
      level: 1,
      visitCount: 0,
      relationship: 50,
      lastNewsDay: 0
    };

    this.activeRegulars.push(newRegular);
    console.log('✅ 새 단골손님 추가:', newRegular.name);
    return newRegular;
  }

  // 기존 addRegular 메서드 (하위 호환성)
  addRegular() {
    return this.addRandomRegular();
  }

  removeRegular() {
    if (this.activeRegulars.length === 0) {
      return null;
    }

    const removed = this.activeRegulars.shift();
    console.log('👋 단골손님 이탈:', removed.name);
    return removed;
  }

  getNewsFromRegular(currentDay) {
    // 뉴스를 줄 수 있는 단골 필터링 (마지막 뉴스 이후 7일 경과)
    const availableRegulars = this.activeRegulars.filter(r => currentDay - r.lastNewsDay >= 7);

    if (availableRegulars.length === 0) {
      return null;
    }

    const regular = availableRegulars[Math.floor(Math.random() * availableRegulars.length)];
    const newsTypes = ['game', 'event', 'competitor', 'tip'];
    const newsType = newsTypes[Math.floor(Math.random() * newsTypes.length)];

    let newsContent = {};

    switch (newsType) {
      case 'game':
        newsContent = {
          type: 'game',
          title: '🎲 게임 추천 정보',
          message: `${regular.name}(${regular.personality})님이 요즘 인기있는 게임 정보를 알려주셨습니다.`,
          bonus: Math.floor(Math.random() * 11) + 15, // 15~25%
          duration: Math.floor(Math.random() * 4) + 5 // 5~8일
        };
        break;
      case 'event':
        newsContent = {
          type: 'event',
          title: '🎉 이벤트 아이디어',
          message: `${regular.name}(${regular.personality})님이 좋은 이벤트 아이디어를 제안했습니다.`,
          bonus: Math.floor(Math.random() * 8) + 10, // 10~17%
          duration: Math.floor(Math.random() * 5) + 7 // 7~11일
        };
        break;
      case 'competitor':
        newsContent = {
          type: 'competitor',
          title: '📰 경쟁 카페 정보',
          message: `${regular.name}(${regular.personality})님이 다른 카페의 약점을 알려주셨습니다.`,
          bonus: Math.floor(Math.random() * 11) + 20, // 20~30%
          duration: Math.floor(Math.random() * 3) + 3 // 3~5일
        };
        break;
      case 'tip':
        newsContent = {
          type: 'tip',
          title: '💡 운영 팁',
          message: `${regular.name}(${regular.personality})님이 카페 운영에 도움되는 팁을 공유했습니다.`,
          bonus: Math.floor(Math.random() * 6) + 8, // 8~13%
          duration: Math.floor(Math.random() * 6) + 10 // 10~15일
        };
        break;
    }

    newsContent.regularId = regular.id;
    newsContent.regularName = regular.name;
    newsContent.regularAvatar = regular.avatar;

    return newsContent;
  }

  acceptNews(regularId, currentDay) {
    const regular = this.activeRegulars.find(r => r.id === regularId);
    if (regular) {
      regular.lastNewsDay = currentDay;
      regular.level = Math.min(5, regular.level + 1);
      regular.relationship = Math.min(100, regular.relationship + 10);
      return true;
    }
    return false;
  }

  rejectNews(regularId, currentDay) {
    const regular = this.activeRegulars.find(r => r.id === regularId);
    if (regular) {
      regular.lastNewsDay = currentDay;
      regular.level = Math.max(1, regular.level - 1);
      regular.relationship = Math.max(0, regular.relationship - 5);
      return true;
    }
    return false;
  }

  getRegularsCount() {
    return this.activeRegulars.length;
  }

  getRegulars() {
    return [...this.activeRegulars];
  }

  // 특정 능력을 가진 단골 손님 찾기
  getRegularsByAbility(abilityType) {
    return this.activeRegulars.filter(r => r.abilityType === abilityType);
  }

  // 특정 단골 손님의 능력 활성화
  activateRegularAbility(regularId) {
    const regular = this.activeRegulars.find(r => r.id === regularId);
    if (!regular) return null;

    regular.visitCount++;

    return {
      abilityType: regular.abilityType,
      abilityValue: regular.abilityValue,
      regularName: regular.name,
      level: regular.level
    };
  }

  // 🆕 단골손님이 뉴스 제공 가능한지 확인
  canProvideNews(regularId, currentDay) {
    const regular = this.activeRegulars.find(r => r.id === regularId);
    if (!regular) return false;

    const daysSinceLastNews = currentDay - regular.lastNewsDay;
    return daysSinceLastNews >= regular.newsFrequency;
  }

  // 🆕 뉴스 생성
  generateNews(regularId, currentDay) {
    const regular = this.activeRegulars.find(r => r.id === regularId);
    if (!regular) {
      console.warn('⚠️ 단골손님을 찾을 수 없습니다:', regularId);
      return null;
    }

    if (!this.canProvideNews(regularId, currentDay)) {
      console.log('ℹ️ 아직 뉴스를 제공할 수 없습니다:', regular.name);
      return null;
    }

    // 해당 단골의 성격과 뉴스 타입에 맞는 템플릿 찾기
    const matchingTemplates = this.newsTemplates.filter(
      t => t.newsType === regular.newsType && t.personality === regular.personality
    );

    // 매칭되는 템플릿이 없으면 뉴스 타입만 일치하는 것 사용
    const templates = matchingTemplates.length > 0
      ? matchingTemplates
      : this.newsTemplates.filter(t => t.newsType === regular.newsType);

    if (templates.length === 0) {
      console.warn('⚠️ 매칭되는 뉴스 템플릿이 없습니다:', regular.newsType);
      return null;
    }

    const template = templates[Math.floor(Math.random() * templates.length)];

    const news = {
      id: this.nextNewsId++,
      regularId: regular.id,
      regularName: regular.name,
      regularAvatar: regular.avatar,
      personality: regular.personality,
      newsType: regular.newsType,
      message: template.message,
      riskLevel: template.riskLevel,
      acceptBenefit: template.acceptBenefit,
      rejectConsequence: template.rejectConsequence,
      bonusType: regular.newsBonusType,
      bonusValue: regular.newsBonusValue,
      duration: regular.newsDuration,
      createdDay: currentDay,
      expiryDay: currentDay + regular.newsDuration
    };

    console.log('📰 뉴스 생성:', regular.name, '-', template.message);
    return news;
  }

  // 🆕 뉴스 템플릿 가져오기
  getNewsTemplate(newsType, personality) {
    const templates = this.newsTemplates.filter(
      t => t.newsType === newsType && t.personality === personality
    );
    return templates.length > 0
      ? templates[Math.floor(Math.random() * templates.length)]
      : null;
  }

  // 🆕 뉴스 보너스 적용
  applyNewsBonus(newsId, accept, currentDay) {
    const news = this.activeNews.find(n => n.id === newsId);
    if (!news) {
      console.warn('⚠️ 뉴스를 찾을 수 없습니다:', newsId);
      return null;
    }

    const regular = this.activeRegulars.find(r => r.id === news.regularId);

    if (accept) {
      // 수락: 보너스 활성화 및 관계도 증가
      if (regular) {
        regular.lastNewsDay = currentDay;
        regular.relationship = Math.min(100, regular.relationship + 10);
        regular.level = Math.min(5, regular.level + 1);
      }

      const activeBonus = {
        newsId: news.id,
        bonusType: news.bonusType,
        bonusValue: news.bonusValue,
        expiryDay: news.expiryDay,
        source: `${news.regularName}의 정보`
      };

      this.activeNews.push(activeBonus);
      console.log('✅ 뉴스 수락:', activeBonus);
      return { accepted: true, bonus: activeBonus };
    } else {
      // 거절: 관계도 감소
      if (regular) {
        regular.lastNewsDay = currentDay;
        regular.relationship = Math.max(0, regular.relationship - 5);
      }

      console.log('❌ 뉴스 거절:', news.regularName);
      return { accepted: false, consequence: news.rejectConsequence };
    }
  }

  // 🆕 만료된 뉴스 보너스 제거
  checkNewsExpiry(currentDay) {
    const expiredNews = this.activeNews.filter(n => n.expiryDay <= currentDay);

    expiredNews.forEach(news => {
      console.log('⏰ 뉴스 보너스 만료:', news.source);
    });

    this.activeNews = this.activeNews.filter(n => n.expiryDay > currentDay);

    return expiredNews;
  }

  // 🆕 현재 활성화된 뉴스 보너스 가져오기
  getActiveNewsBonus() {
    return [...this.activeNews];
  }

  // 🆕 뉴스를 제공할 수 있는 단골 목록
  getNewsProviders(currentDay) {
    return this.activeRegulars.filter(r => this.canProvideNews(r.id, currentDay));
  }
}

export default RegularsManager;
