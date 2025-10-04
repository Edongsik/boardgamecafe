import { useState, useEffect, useRef } from 'react';

// Managers
import TablesManager from '../managers/TablesManager';
import GamesManager from '../managers/GamesManager';
import RegularsManager from '../managers/RegularsManager';
import ReviewsManager from '../managers/ReviewsManager';
import CommunityManager from '../managers/CommunityManager';

// Config & Data
import { GAME_CONFIG, TIME_CONFIG, ECONOMY_CONFIG } from '../config/gameConfig';
import { weeklyGames } from '../data/weeklyGames';
import { purchasableGames } from '../data/purchasableGames';
import { formatNumber } from '../utils/formatters';

export const useGameEngine = () => {
  // --- 매니저 인스턴스 ---
  const tablesManagerRef = useRef(new TablesManager());
  const gamesManagerRef = useRef(new GamesManager());
  const regularsManagerRef = useRef(new RegularsManager());
  const reviewsManagerRef = useRef(new ReviewsManager());
  const communityManagerRef = useRef(new CommunityManager());

  // --- 일시정지 추적 ---
  const pausedByTable = useRef(false);

  // --- 게임 핵심 상태 ---
  const [day, setDay] = useState(1);
  const [revenue, setRevenue] = useState(0);
  const [satisfaction, setSatisfaction] = useState(GAME_CONFIG.INITIAL_SATISFACTION);
  const [regulars, setRegulars] = useState(GAME_CONFIG.INITIAL_REGULARS);
  const [funds, setFunds] = useState(GAME_CONFIG.INITIAL_FUNDS);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [tables, setTables] = useState(tablesManagerRef.current.getTables());
  const [ownedGames, setOwnedGames] = useState(gamesManagerRef.current.getOwnedGames());
  
  // --- 게임 진행 관련 상태 ---
  const [weeklyGameIndex, setWeeklyGameIndex] = useState(0);
  const previousSatisfactionRef = useRef(GAME_CONFIG.INITIAL_SATISFACTION);
  const [regularNewsBonus, setRegularNewsBonus] = useState(0);
  const [regularNewsBonusDays, setRegularNewsBonusDays] = useState(0);
  const [currentRegularNews, setCurrentRegularNews] = useState(null);
  const [isRegularsLoaded, setIsRegularsLoaded] = useState(false);

  // --- UI 상태 ---
  const [modalState, setModalState] = useState({
    event: false, gamePurchase: false, result: false, eventSelection: false, regularNews: false, reviews: false, tradeGames: false, communityNews: false,
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [resultData, setResultData] = useState({ type: 'neutral', title: '', content: '' });
  const [hasNewCommunityNews, setHasNewCommunityNews] = useState(false);
  
  const lastSettlementDay = useRef(0);
  const lastWeeklyEventDay = useRef(0);
  const hasExpandedTo5Tables = useRef(false);
  const lastVisitorMilestone = useRef(0);
  const lastCommunityWeek = useRef(0);

  const gameTickCallback = useRef(() => {});

  // --- 헬퍼 함수 ---
  const openModal = (modalName) => setModalState(prev => ({ ...Object.fromEntries(Object.keys(prev).map(k => [k, false])), [modalName]: true }));
  const closeModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: false }));

  const showResult = (type, title, content, warning = '') => {
    setResultData({ type, title, content, warning });
    openModal('result');
  };

  const handleExpense = (cost) => {
    setRevenue(currentRevenue => {
      if (currentRevenue >= cost) {
        return currentRevenue - cost;
      } else {
        const remainingCost = cost - currentRevenue;
        setFunds(currentFunds => currentFunds - remainingCost);
        return 0;
      }
    });
  };

  // 🔥 개선된 테이블 순환 로직
const simulateRandomTableEventInEngine = () => {
  const currentTables = tablesManagerRef.current.getTables();
  const tableIndex = Math.floor(Math.random() * currentTables.length);
  const table = currentTables[tableIndex];
  let didChange = false;
  let newVisitor = false;

  // 🔒 선택된 테이블은 퇴장 방지
  if (table.id === selectedTable) {
    return { didChange: false, newVisitor: false };
  }

  if (table.occupied) {
    // 🔥 손님 퇴장 확률 - 만족도가 낮을수록 빨리 퇴장
    let leaveChance;

    if (table.satisfaction === 5) {
      leaveChance = 0.60; // 만족도 5: 60% (적당히 머묾 - 게임 끝나고 나감)
    } else if (table.satisfaction === 4) {
      leaveChance = 0.40; // 만족도 4: 40% (오래 머묾)
    } else if (table.satisfaction === 3) {
      leaveChance = 0.50; // 만족도 3: 50% (보통)
    } else if (table.satisfaction === 2) {
      leaveChance = 0.50; // 만족도 2: 50% (보통 속도로 나감)
    } else {
      leaveChance = 0.80; // 만족도 1: 80% (빨리 나감 - 화나서)
    }

    // 🔥 턴 수에 따라 퇴장 확률 증가 (활동이 없을수록 떠날 확률 증가)
    const turnsAtTable = table.turnsAtTable || 0;
    const turnBonus = Math.min(0.3, turnsAtTable * 0.05); // 턴당 5%씩 증가, 최대 30%
    leaveChance = Math.min(0.95, leaveChance + turnBonus);

    if (Math.random() < leaveChance) {
      // 손님 퇴장 시 리뷰 생성 (30% 확률)
      if (Math.random() < 0.3) {
        const currentTables = tablesManagerRef.current.getTables();
        const occupiedCount = currentTables.filter(t => t.occupied).length;
        const unhappyCount = currentTables.filter(t => t.occupied && t.satisfaction <= 2).length;

        reviewsManagerRef.current.generateReview(day, satisfaction, {
          isFullHouse: occupiedCount === currentTables.length,
          hasUnhappyTables: unhappyCount >= 2,
          customerType: 'visitor'
        });
      }

      tablesManagerRef.current.resetTable(table.id);
      didChange = true;
    } else {
      // 🔥 퇴장하지 않았다면 턴 카운터 증가
      tablesManagerRef.current.updateTable(table.id, {
        turnsAtTable: turnsAtTable + 1
      });
      didChange = true;
    }
  } else {
    // 🔥 신규 손님 입장 확률 상향 조정
    if (Math.random() < 0.8) { // 80% 확률
      const randomGame = gamesManagerRef.current.getRandomGame();
      if (randomGame) {
        // ⭐ 평점에 따른 초기 만족도 설정
        const rating = satisfaction / 10;
        let initialSatisfaction;

        if (rating >= 6) {
          initialSatisfaction = Math.floor(Math.random() * 3) + 2; // 2~4
        } else {
          initialSatisfaction = 2;
        }

        tablesManagerRef.current.updateTable(table.id, {
          occupied: true,
          game: randomGame.name,
          difficulty: randomGame.difficulty,
          satisfaction: initialSatisfaction,
          status: 'happy',
          turnsAtTable: 0
        });
        didChange = true;
        newVisitor = true;
      }
    }
  }
  return { didChange, newVisitor };
};


  // --- 게임 루프 ---
useEffect(() => {
  gameTickCallback.current = () => {
    const currentTables = tablesManagerRef.current.getTables();
    const totalSatisfaction = currentTables.reduce((sum, table) => table.occupied ? sum + table.satisfaction : sum, 0);
    setRevenue(prev => prev + totalSatisfaction * 2000);

    const perfectSatisfactionTables = currentTables.filter(t => t.occupied && t.satisfaction === 5).length;
    const unhappyTables = currentTables.filter(t => t.occupied && t.satisfaction <= 2).length;
    const emptyTables = currentTables.filter(t => !t.occupied).length;

    const satisfactionBonus = perfectSatisfactionTables * 0.3;

    if (perfectSatisfactionTables > 0) {
      for (let i = 0; i < perfectSatisfactionTables; i++) {
        if (Math.random() < 0.05) {
          setRegulars(prevRegulars => {
            const newCount = prevRegulars + 1;
            regularsManagerRef.current.addRegular();
            return newCount;
          });
        }
      }
    }

    // 🔻 불만족 손님으로 인한 단골 손님 감소
    if (unhappyTables >= 2) {
      if (Math.random() < 0.02) { // 2% 확률로 단골 손님 이탈
        setRegulars(prevRegulars => {
          const newCount = Math.max(1, prevRegulars - 1);
          if (prevRegulars > newCount) {
            regularsManagerRef.current.removeRegular();
          }
          return newCount;
        });
      }
    }

    // 🔥 평점 변화 로직 개선
    let satisfactionChange = 0;

    // 긍정적 요소
    if (tablesManagerRef.current.getOccupiedCount() === tables.length) {
      satisfactionChange += 0.2; // 만석: +0.2
    }
    if (perfectSatisfactionTables >= 2) {
      satisfactionChange += 0.1; // 매우 만족한 손님 2명 이상: +0.1
    }

    // 🔻 부정적 요소
    if (tablesManagerRef.current.getOccupiedCount() < 2) {
      satisfactionChange -= 0.3; // 손님 적음: -0.3
    }
    if (emptyTables >= 3) {
      satisfactionChange -= 0.2; // 빈 테이블 많음: -0.2
    }
    if (unhappyTables >= 1) {
      satisfactionChange -= unhappyTables * 0.4; // 불만족 손님 1명당 -0.4
    }
    if (unhappyTables >= 3) {
      satisfactionChange -= 0.5; // 불만족 손님 3명 이상: 추가 -0.5
    }

    satisfactionChange += satisfactionBonus;

    // 🔥 트렌딩 게임 보호 로직
    const ownedTrendingGames = gamesManagerRef.current.getOwnedGames()
      .filter(game => communityManagerRef.current.isTrendingGame(game.name));

    if (ownedTrendingGames.length > 0 && satisfactionChange < 0) {
      console.log('🔥 트렌딩 게임 보유로 평점 하락 방지:', ownedTrendingGames.map(g => g.name));
      satisfactionChange = 0; // 하락 무효화
    }

    setSatisfaction(currentSat => {
      const currentRating = currentSat / 10;

      // 평점 상승 시 구간별 저항 적용
      if (satisfactionChange > 0) {
        if (currentRating >= 8) {
          satisfactionChange *= 0.5; // 평점 8+: 상승폭 50% 감소
        } else if (currentRating >= 7) {
          satisfactionChange *= 0.7; // 평점 7-8: 상승폭 30% 감소
        } else if (currentRating >= 6) {
          satisfactionChange *= 0.85; // 평점 6-7: 상승폭 15% 감소
        }
      }

      const newSatisfaction = Math.max(0, Math.min(100, currentSat + satisfactionChange));
      const changeSinceLastCheck = newSatisfaction - previousSatisfactionRef.current;

      if (Math.abs(changeSinceLastCheck) >= 20) {
        const regularsChange = Math.floor(changeSinceLastCheck / 20);
        setRegulars(prevRegulars => Math.max(1, prevRegulars + regularsChange));
        previousSatisfactionRef.current = newSatisfaction;
      }
      return newSatisfaction;
    });

    // 🔥 테이블 이벤트 발생 확률 대폭 상향
    if (Math.random() > 0.15) { // 85% 확률
      const eventResult = simulateRandomTableEventInEngine();
      if (eventResult.didChange) {
          setTables(tablesManagerRef.current.getTables());
          if (eventResult.newVisitor) {
            setTotalVisitors(prev => prev + Math.floor(Math.random() * 2) + 2);
            // 🔻 평점에 따라 신규 방문 시 만족도 변화
            setSatisfaction(prev => {
              const rating = prev / 10;
              if (rating >= 8) return prev; // 평점 8+: 보너스 없음
              else if (rating >= 7) return Math.min(100, prev + 0.3); // 평점 7-8: +0.3
              else if (rating >= 6) return Math.min(100, prev + 0.5); // 평점 6-7: +0.5
              else if (rating >= 5) return prev; // 평점 5-6: 변화 없음
              else return Math.max(0, prev - 0.5); // 평점 5 미만: -0.5
            });
          }
      }
    }
  };
});

  // 🔥 CSV 데이터 로드 (컴포넌트 마운트 시 1회)
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 단골손님, 게임, 커뮤니티 뉴스 데이터 동시 로드
        await Promise.all([
          regularsManagerRef.current.loadRegularsPool(),
          gamesManagerRef.current.loadGamesPool(),
          communityManagerRef.current.loadCommunityNews()
        ]);

        setIsRegularsLoaded(true);
        setOwnedGames(gamesManagerRef.current.getOwnedGames());

        // 초기 주차 트렌딩 게임 업데이트
        const initialWeek = 1;
        communityManagerRef.current.updateTrendingGames(initialWeek);

        console.log('✅ 모든 CSV 데이터 로드 완료');
      } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        setIsRegularsLoaded(false);
      }
    };

    loadAllData();
  }, []); // 마운트 시 1회만 실행

  useEffect(() => {
    if (isPaused) return;
    const gameLoop = setInterval(() => gameTickCallback.current(), TIME_CONFIG.GAME_LOOP_INTERVAL / gameSpeed);
    return () => clearInterval(gameLoop);
  }, [isPaused, gameSpeed]);

  useEffect(() => {
    if (isPaused) return;
    const dayLoop = setInterval(() => setDay(prevDay => prevDay + 1), TIME_CONFIG.DAY_LOOP_INTERVAL / gameSpeed);
    return () => clearInterval(dayLoop);
  }, [isPaused, gameSpeed]);

  useEffect(() => {
    if (day > lastWeeklyEventDay.current && day % 7 === 0) {
      openModal('event');
      lastWeeklyEventDay.current = day;
    }
    if (day > lastSettlementDay.current && day % 30 === 0) {
      const cost = ECONOMY_CONFIG.MONTHLY_MAINTENANCE_COST;
      setFunds(prevFunds => prevFunds + revenue - cost);
      showResult('settlement', '📊 월말 정산 완료!', `매출 +₩${formatNumber(revenue)}\n유지비 -₩${formatNumber(cost)}\n순수익: ₩${formatNumber(revenue - cost)}`);
      setRevenue(0);
      lastSettlementDay.current = day;
    }

    // 단골손님 뉴스 보너스 카운트다운
    if (regularNewsBonusDays > 0) {
      setRegularNewsBonusDays(prev => prev - 1);
      if (regularNewsBonusDays === 1) {
        setRegularNewsBonus(0);
      }
    }

    // 뉴스 보너스 만료 체크
    regularsManagerRef.current.checkNewsExpiry(day);

    // 🆕 주차별 커뮤니티 뉴스 업데이트
    const currentWeek = Math.floor(day / 7) + 1;
    if (currentWeek > lastCommunityWeek.current && communityManagerRef.current.isLoaded) {
      lastCommunityWeek.current = currentWeek;

      const trendingGames = communityManagerRef.current.updateTrendingGames(currentWeek);
      const news = communityManagerRef.current.getCurrentNews();

      // 새 소식 알림
      if (news.length > 0) {
        setHasNewCommunityNews(true);

        setTimeout(() => {
          showResult('neutral', '📰 새로운 커뮤니티 소식',
            `Week ${currentWeek} 소식이 업데이트되었습니다.\nDay를 클릭하여 확인하세요!`);
        }, 1000);
      }
    }
  }, [day, revenue, regularNewsBonusDays]);
  
  useEffect(() => {
    const isAnyModalOpen = Object.values(modalState).some(Boolean);
    const shouldPause = isAnyModalOpen || selectedTable !== null;
    setIsPaused(shouldPause);
  }, [modalState, selectedTable]);

  useEffect(() => {
    const currentMilestone = Math.floor(totalVisitors / 100);
    if (currentMilestone > lastVisitorMilestone.current && totalVisitors >= 100) {
      lastVisitorMilestone.current = currentMilestone;

      const mostUsed = gamesManagerRef.current.getMostRecommendedGame();
      if (mostUsed) {
        gamesManagerRef.current.removeGame(mostUsed.name);
        setOwnedGames(gamesManagerRef.current.getOwnedGames());
        showResult('warning', '🗑️ 게임 폐기',
          `${mostUsed.name}이(가) 너무 많이 사용되어 낡았습니다.\n` +
          `추천 횟수: ${mostUsed.recommendCount}회\n` +
          `누적 방문자: ${totalVisitors}명\n\n` +
          `💡 힌트: 중고거래를 통해 새 게임으로 교환할 수 있습니다!`
        );
      }
    }
  }, [totalVisitors]);


  // --- 이벤트 핸들러 ---
  const handleTableClick = (table) => {
    if (!table) {
      setSelectedTable(null);
      return;
    }

    // 같은 테이블을 다시 클릭하면 선택 해제
    if (selectedTable === table.id && table.occupied) {
      setSelectedTable(null);
      return;
    }

    setSelectedTable(table.id);
    if (!table.occupied) {
      openModal('eventSelection');
    }
    // table.occupied인 경우 선택 상태만 토글
  };

  const handlePurchaseGame = (game) => {
    if ((revenue + funds) < game.cost) {
      showResult('negative', '💸 자금 부족', `${game.name} 구매 자금 부족`);
      return;
    }
    handleExpense(game.cost);
    gamesManagerRef.current.addGame({ name: game.name, difficulty: game.difficulty || 3 });
    setOwnedGames(gamesManagerRef.current.getOwnedGames());
    showResult('immediate', `🎉 ${game.name} 구매 완료!`, `새로운 게임 입고!`);
    closeModal('gamePurchase');
  };
  

  const handleRecommendGame = (game) => {
  const table = tablesManagerRef.current.getTable(selectedTable);
  if (!table) return;

  // 🆕 추천 카운트 증가
  gamesManagerRef.current.incrementRecommendCount(game.name);

  // 손님 수준과 게임 난이도 비교
  const customerLevel = table.customerLevel || 2;
  const gameDifficulty = game.difficulty;
  const difficultyGap = Math.abs(customerLevel - gameDifficulty);
  
  // 🎯 난이도 차이에 따른 성공 확률 계산
  let baseSuccessRate;
  if (difficultyGap === 0) {
    baseSuccessRate = 0.85; // 완벽한 매칭: 85%
  } else if (difficultyGap === 1) {
    baseSuccessRate = 0.70; // 약간 차이: 70%
  } else if (difficultyGap === 2) {
    baseSuccessRate = 0.50; // 꽤 차이: 50%
  } else {
    baseSuccessRate = 0.30; // 큰 차이: 30%
  }
  
  // 현재 손님 만족도에 따른 보너스 (만족도 높을수록 성공률 증가)
  const satisfactionBonus = (table.satisfaction - 3) * 0.05; // -0.1 ~ +0.1

  // 단골손님 뉴스 보너스 반영
  const newsBonus = regularNewsBonus / 100;

  const finalSuccessRate = Math.max(0.1, Math.min(0.95, baseSuccessRate + satisfactionBonus + newsBonus));

  const isSuccess = Math.random() < finalSuccessRate;
  const isLevelMatch = difficultyGap <= 1;

  // 만족도 증가량 계산
  let satisfactionIncrease;
  let message;
  
  if (isSuccess) {
    if (difficultyGap === 0) {
      // 완벽한 매칭: 2~3 랜덤
      satisfactionIncrease = Math.floor(Math.random() * 2) + 2;
      message = `손님들이 ${game.name}을(를) 아주 좋아합니다! 완벽한 선택! 만족도 +${satisfactionIncrease} 🎉`;
    } else if (difficultyGap === 1) {
      // 적당한 매칭: 1~2 랜덤
      satisfactionIncrease = Math.floor(Math.random() * 2) + 1;
      message = `손님들이 ${game.name}을(를) 좋아합니다! 만족도 +${satisfactionIncrease}`;
    } else {
      // 미스매칭이지만 성공: 1 고정
      satisfactionIncrease = 1;
      message = `손님들이 ${game.name}에 적응했습니다. 만족도 +1`;
    }
  } else {
    // 🔥 실패 시 난이도 차이에 따라 다른 페널티
    if (difficultyGap === 0 || difficultyGap === 1) {
      // 난이도는 맞는데 실패: -1 (운이 나빴음)
      satisfactionIncrease = -1;
      message = `손님들이 ${game.name}을(를) 별로 좋아하지 않습니다. 만족도 -1`;
    } else if (difficultyGap === 2) {
      // 난이도 차이 큼: -1~-2 랜덤
      satisfactionIncrease = Math.random() < 0.5 ? -1 : -2;
      message = `${game.name}은(는) 손님들에게 ${gameDifficulty > customerLevel ? '너무 어려웠습니다' : '너무 쉬웠습니다'}. 만족도 ${satisfactionIncrease}`;
    } else {
      // 난이도 차이 매우 큼: -2~-3 랜덤
      satisfactionIncrease = Math.floor(Math.random() * 2) - 2; // -2 또는 -3
      message = `${game.name}은(는) 손님들 수준과 맞지 않습니다! 만족도 ${satisfactionIncrease} 😞`;
    }
  }

  // 테이블 만족도 업데이트 + 턴 카운터 리셋
  const newSatisfaction = Math.max(1, Math.min(5, table.satisfaction + satisfactionIncrease));
  tablesManagerRef.current.updateTable(selectedTable, {
    game: game.name,
    difficulty: game.difficulty,
    satisfaction: newSatisfaction,
    status: newSatisfaction >= 4 ? 'happy' : newSatisfaction >= 2 ? 'confused' : 'unhappy',
    turnsAtTable: 0  // 🔥 게임 추천 후 턴 카운터 리셋 (활동 갱신)
  });

  // 게임 추천 후 리뷰 생성 (20% 확률)
  if (Math.random() < 0.2) {
    reviewsManagerRef.current.generateReview(day, satisfaction, {
      customerType: 'visitor'
    });
  }

  if (isSuccess) {
    showResult('immediate', '😊 게임 추천 성공!', message);
    setTables(tablesManagerRef.current.getTables());
  } else {
    const updatedTable = tablesManagerRef.current.getTable(selectedTable);
    showResult('negative', '😞 게임 추천 실패', message);

    if (updatedTable.satisfaction === 1) {
      setTimeout(() => {
        tablesManagerRef.current.resetTable(selectedTable);
        setTables(tablesManagerRef.current.getTables());
        setSatisfaction(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      setTables(tablesManagerRef.current.getTables());
    }
  }

  // 팝업에서 직접 처리하므로 모달 닫기 제거
  setSelectedTable(null);
};

const executeEvent = (eventType) => {
  const cost = ECONOMY_CONFIG.EVENT_COSTS[eventType];
  if ((revenue + funds) < cost) {
    showResult('negative', '💸 자금 부족', '이벤트 자금 부족');
    closeModal('eventSelection');
    return;
  }
  handleExpense(cost);
  
  const table = tablesManagerRef.current.getTable(selectedTable);
  if (table && !table.occupied) {
    const randomGame = gamesManagerRef.current.getRandomGame();
    if(randomGame) {
      tablesManagerRef.current.updateTable(selectedTable, { 
        occupied: true, 
        game: randomGame.name, 
        difficulty: randomGame.difficulty, 
        satisfaction: 3 
      });
    }
    setTables(tablesManagerRef.current.getTables());
  }
  
  // 🎯 이벤트 성공 단계 결정 (1~3단계)
  const successRoll = Math.random();
  let successLevel;
  let resultType;
  let resultTitle;
  let resultContent;
  
  if (successRoll < 0.15) {
    // 15% 확률 - 실패
    successLevel = 0;
    resultType = 'negative';
  } else if (successRoll < 0.50) {
    // 35% 확률 - 1단계 성공
    successLevel = 1;
    resultType = 'neutral';
  } else if (successRoll < 0.85) {
    // 35% 확률 - 2단계 성공
    successLevel = 2;
    resultType = 'immediate';
  } else {
    // 15% 확률 - 3단계 대성공
    successLevel = 3;
    resultType = 'immediate';
  }
  
  // 이벤트 타입별 보상 설정
  if (eventType === 'sns') {
    if (successLevel === 0) {
      resultTitle = '📱 SNS 홍보 실패';
      resultContent = '홍보가 별다른 반응을 얻지 못했습니다.';
    } else if (successLevel === 1) {
      const visitors = Math.floor(Math.random() * 5) + 5; // 5~9명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 2));
      resultTitle = '📱 SNS 홍보 성공';
      resultContent = `방문자 +${visitors}명, 만족도 +2%`;
    } else if (successLevel === 2) {
      const visitors = Math.floor(Math.random() * 8) + 10; // 10~17명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 5));
      resultTitle = '📱 SNS 홍보 대성공!';
      resultContent = `방문자 +${visitors}명, 만족도 +5%`;
    } else {
      const visitors = Math.floor(Math.random() * 10) + 20; // 20~29명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 10));
      setRegulars(prev => prev + 1);
      resultTitle = '📱 SNS 홍보 대박! 🎉';
      resultContent = `바이럴 성공!\n방문자 +${visitors}명, 만족도 +10%, 단골손님 +1명`;
    }
  } else if (eventType === 'tournament') {
    if (successLevel === 0) {
      resultTitle = '🏆 게임 대회 실패';
      resultContent = '대회 준비 과정에서 문제가 발생했습니다.';
    } else if (successLevel === 1) {
      const visitors = Math.floor(Math.random() * 8) + 10; // 10~17명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 5));
      setRevenue(prev => prev + 150000);
      resultTitle = '🏆 게임 대회 성공';
      resultContent = `방문자 +${visitors}명, 만족도 +5%, 매출 +₩150,000`;
    } else if (successLevel === 2) {
      const visitors = Math.floor(Math.random() * 12) + 15; // 15~26명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 12));
      setRevenue(prev => prev + 300000);
      setRegulars(prev => prev + 1);
      resultTitle = '🏆 게임 대회 대성공!';
      resultContent = `방문자 +${visitors}명, 만족도 +12%, 매출 +₩300,000\n단골손님 +1명`;
    } else {
      const visitors = Math.floor(Math.random() * 15) + 25; // 25~39명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 20));
      setRevenue(prev => prev + 500000);
      setRegulars(prev => prev + 3);
      resultTitle = '🏆 게임 대회 전설의 성공! 🎉';
      resultContent = `역대급 대회!\n방문자 +${visitors}명, 만족도 +20%, 매출 +₩500,000\n단골손님 +3명`;
    }
  } else if (eventType === 'discount') {
    if (successLevel === 0) {
      resultTitle = '💰 할인 이벤트 실패';
      resultContent = '할인 이벤트가 큰 호응을 얻지 못했습니다.';
    } else if (successLevel === 1) {
      const visitors = Math.floor(Math.random() * 15) + 15; // 15~29명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 2));
      resultTitle = '💰 할인 이벤트 성공';
      resultContent = `방문자 +${visitors}명, 만족도 +2%`;
    } else if (successLevel === 2) {
      const visitors = Math.floor(Math.random() * 20) + 25; // 25~44명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 5));
      resultTitle = '💰 할인 이벤트 대성공!';
      resultContent = `방문자 +${visitors}명, 만족도 +5%`;
    } else {
      const visitors = Math.floor(Math.random() * 25) + 40; // 40~64명
      setTotalVisitors(prev => prev + visitors);
      setSatisfaction(prev => Math.min(100, prev + 8));
      setRegulars(prev => prev + 2);
      resultTitle = '💰 할인 이벤트 초대박! 🎉';
      resultContent = `입소문 확산!\n방문자 +${visitors}명, 만족도 +8%, 단골손님 +2명`;
    }
  }
  
  // 이벤트 종료 후 리뷰 생성 (성공한 경우에만)
  if (successLevel > 0) {
    reviewsManagerRef.current.generateReview(day, satisfaction, {
      afterEvent: true,
      customerType: 'visitor'
    });
  }

  showResult(resultType, resultTitle, resultContent);
  closeModal('eventSelection');
};
  
  const handleAIAccept = () => {
    const currentGame = weeklyGames[weeklyGameIndex % weeklyGames.length];
    if ((revenue + funds) < currentGame.cost) {
      showResult('negative', '💸 자금 부족', `${currentGame.name} 구매 자금 부족`);
      closeModal('event');
      return;
    }
    handleExpense(currentGame.cost);
    gamesManagerRef.current.addGame({ name: currentGame.name, difficulty: currentGame.difficulty || 5 });
    setOwnedGames(gamesManagerRef.current.getOwnedGames());
    setWeeklyGameIndex(prev => prev + 1);
    showResult('immediate', `✅ ${currentGame.name} 입고 완료!`, '새로운 인기 게임 입고!');
    closeModal('event');
  };

  const handleAIReject = () => {
    setWeeklyGameIndex(prev => prev + 1);
    showResult('neutral', '🤔 AI 추천 거절', '안전한 선택을 했습니다.');
    closeModal('event');
  };

  const handleAddTable = () => {
    const tableCost = 5000000;
    const currentTableCount = tables.length;

    if (currentTableCount >= 8) {
      showResult('negative', '❌ 테이블 추가 불가', '최대 8개까지만 테이블을 추가할 수 있습니다.');
      return;
    }

    if ((revenue + funds) < tableCost) {
      showResult('negative', '💸 자금 부족', `테이블 추가 비용: ₩${formatNumber(tableCost)}`);
      return;
    }

    handleExpense(tableCost);
    const result = tablesManagerRef.current.addTable();

    if (result && result.success) {
      setTables(tablesManagerRef.current.getTables());
      showResult('immediate', '🎉 테이블 추가 완료!', `새로운 테이블이 추가되었습니다!\n비용: -₩${formatNumber(tableCost)}`);
    } else {
      showResult('negative', '❌ 테이블 추가 실패', result.message || '테이블 추가에 실패했습니다.');
    }
  };
  
  const handleRegularsClick = () => {
    // 뉴스를 제공할 수 있는 단골 목록 가져오기
    const newsProviders = regularsManagerRef.current.getNewsProviders(day);

    if (newsProviders.length === 0) {
      showResult('neutral', '📢 뉴스 없음', '현재 단골손님으로부터 받을 수 있는 뉴스가 없습니다.\n단골손님들은 일정 주기마다 정보를 제공합니다.');
      return;
    }

    // 랜덤으로 한 명 선택
    const selectedRegular = newsProviders[Math.floor(Math.random() * newsProviders.length)];
    const news = regularsManagerRef.current.generateNews(selectedRegular.id, day);

    if (news) {
      setCurrentRegularNews(news);
      openModal('regularNews');
    } else {
      showResult('neutral', '📢 뉴스 없음', '현재 단골손님으로부터 받을 수 있는 뉴스가 없습니다.');
    }
  };

  const handleAcceptRegularNews = () => {
    if (!currentRegularNews) return;

    const result = regularsManagerRef.current.applyNewsBonus(currentRegularNews.id, true, day);

    if (result && result.accepted) {
      setRegularNewsBonus(result.bonus.bonusValue);
      setRegularNewsBonusDays(currentRegularNews.duration);

      showResult('immediate', '✅ 뉴스 수락',
        `${currentRegularNews.message}\n\n📊 효과: ${currentRegularNews.acceptBenefit}\n보너스: +${result.bonus.bonusValue}% (${currentRegularNews.duration}일간)`
      );
    }

    setCurrentRegularNews(null);
    closeModal('regularNews');
  };

  const handleRejectRegularNews = () => {
    if (!currentRegularNews) return;

    const result = regularsManagerRef.current.applyNewsBonus(currentRegularNews.id, false, day);

    let message = '안전한 선택을 했습니다.';
    if (result && result.consequence && result.consequence !== '없음') {
      message += `\n\n⚠️ ${result.consequence}`;
    }

    showResult('neutral', '❌ 뉴스 거절', message);
    setCurrentRegularNews(null);
    closeModal('regularNews');
  };

  const handleShowReviews = () => {
    openModal('reviews');
  };

  const handleOpenTrade = () => {
    openModal('tradeGames');
  };

  const handleOpenCommunityNews = () => {
    setHasNewCommunityNews(false); // 읽음 처리
    openModal('communityNews');
  };

  const handleTradeGames = (selectedGames, targetGame) => {
    const totalValue = gamesManagerRef.current.calculateTotalTradeValue(selectedGames);
    const targetPrice = targetGame.price || 30000;
    const shortfall = targetPrice - totalValue;

    if (shortfall > 0 && (revenue + funds) < shortfall) {
      showResult('negative', '💸 자금 부족',
        `교환하려면 추가로 ₩${formatNumber(shortfall)}이 필요합니다.\n` +
        `현재 자금: ₩${formatNumber(revenue + funds)}`
      );
      return;
    }

    // 부족한 금액 차감
    if (shortfall > 0) {
      handleExpense(shortfall);
    }

    // 교환 실행
    const result = gamesManagerRef.current.tradeGames(selectedGames, targetGame.name, day);

    if (result.success) {
      setOwnedGames(gamesManagerRef.current.getOwnedGames());
      showResult('immediate', '🔄 중고거래 완료!',
        `${selectedGames.join(', ')}을(를) ${targetGame.name}(으)로 교환했습니다!\n\n` +
        `중고 가치: ₩${formatNumber(totalValue)}\n` +
        `목표 가격: ₩${formatNumber(targetPrice)}` +
        (shortfall > 0 ? `\n추가 지불: ₩${formatNumber(shortfall)}` : `\n거스름돈: ₩${formatNumber(-shortfall)}`)
      );
      closeModal('tradeGames');
    }
  };

  const handlePauseToggle = () => setIsPaused(p => !p);
  const handleSpeedChange = () => setGameSpeed(s => (s === 1 ? TIME_CONFIG.GAME_SPEED_MULTIPLIER : 1));

  // --- UI에 전달할 최종 데이터 ---
  const uniqueGames = gamesManagerRef.current.getUniqueOwnedGames();
  const currentWeeklyGame = weeklyGames[weeklyGameIndex % weeklyGames.length];

  // 🆕 CSV 기반 구매 가능 게임 목록
  const availablePurchases = gamesManagerRef.current.getPurchasableGames({
    day,
    totalVisitors,
    satisfaction,
    regulars
  }).slice(0, 6); // 최대 6개 표시

  const availableGamesForRecommend = selectedTable ? uniqueGames.filter(game => {
    const table = tablesManagerRef.current.getTable(selectedTable);
    return table && game.name !== table.game;
  }) : [];

  const recentReviews = reviewsManagerRef.current.getRecentReviews(15);

  const currentWeek = Math.floor(day / 7) + 1;
  const currentCommunityNews = communityManagerRef.current.getCurrentNews();
  const trendingGames = communityManagerRef.current.getTrendingGames();

  return {
    day, revenue, satisfaction: Math.floor(satisfaction), regulars, funds, totalVisitors, tables,
    uniqueGames, isPaused, gameSpeed, resultData, modalState,
    availablePurchases, availableGamesForRecommend, selectedTable, currentWeeklyGame,
    regularNewsBonus, regularNewsBonusDays, currentRegularNews, recentReviews, isRegularsLoaded,
    currentWeek, currentCommunityNews, trendingGames, hasNewCommunityNews,
    gamesManager: gamesManagerRef.current, // 🆕 게임 매니저 전달
    communityManager: communityManagerRef.current, // 🆕 커뮤니티 매니저 전달
    openModal, closeModal, handleTableClick, handlePurchaseGame,
    handleRecommendGame, executeEvent, handleAIAccept, handleAIReject,
    handlePauseToggle, handleSpeedChange, handleAddTable,
    handleRegularsClick, handleAcceptRegularNews, handleRejectRegularNews, handleShowReviews,
    handleOpenTrade, handleTradeGames, handleOpenCommunityNews,
  };
};