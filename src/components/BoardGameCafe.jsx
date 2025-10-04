import React from 'react';

// 🪝 1. 핵심 게임 로직은 커스텀 훅에서 모두 가져옵니다.
// => components 폴더에서 나와서 hooks 폴더로 들어가야 하므로 '../hooks/...'
import { useGameEngine } from '../hooks/useGameEngine';

// 🧩 2. 분리된 모든 UI 컴포넌트들을 불러옵니다.
// => BoardGameCafe와 같은 components 폴더 안에 있으므로 './...'
import Header from './Header';
import StatsDisplay from './StatsDisplay';
import TablesGrid from './TablesGrid';
import OwnedGamesList from './OwnedGamesList';
import ControlButtons from './ControlButtons';
import Modal from './Modal';
import ActiveBuffsDisplay from './ActiveBuffsDisplay';

// 🖼️ 3. 각 모달의 '내용물'이 될 컴포넌트들을 불러옵니다.
// => components 폴더에서 나와서 modals 폴더로 들어가야 하므로 '../modals/...'
import ResultModalContent from '../modals/ResultModalContent';
import GamePurchaseModalContent from '../modals/GamePurchaseModalContent';
import EventModalContent from '../modals/EventModalContent';
import AIEventModalContent from '../modals/AIEventModalContent';
import RegularNewsModalContent from '../modals/RegularNewsModalContent';
import ReviewsModalContent from '../modals/ReviewsModalContent';
import TradeGamesModalContent from '../modals/TradeGamesModalContent';
import CommunityNewsModalContent from '../modals/CommunityNewsModalContent';
import ManageRecommendListModalContent from '../modals/ManageRecommendListModalContent';
import GameRecommendModalContent from '../modals/GameRecommendModalContent';

import { TEXTS } from '../data/textData';

const BoardGameCafe = () => {
  // useGameEngine 훅 한 줄로 게임의 모든 상태와 함수를 가져옵니다.
  // 이제 BoardGameCafe 컴포넌트는 자체적으로 복잡한 로직을 갖지 않습니다.
  const {
    // 화면 표시에 필요한 상태값들
    day, revenue, satisfaction, regulars, funds, totalVisitors, tables,
    uniqueGames, isPaused, gameSpeed, resultData, modalState,
    availablePurchases, availableGamesForRecommend, selectedTable, currentWeeklyGame,
    regularNewsBonus, regularNewsBonusDays, currentRegularNews, recentReviews,
    gamesManager, currentWeek, currentCommunityNews, trendingGames, hasNewCommunityNews,
    communityManager, recommendList, selectedGameInfo,
    newVisitorBoost, permanentEventBonus, permanentDiscountRate, perfectServiceBonus,
    buffManager,

    // 자식 컴포넌트에 전달할 함수들
    openModal, closeModal, handleTableClick, handlePurchaseGame,
    handleRecommendGame, executeEvent, handleAIAccept, handleAIReject,
    handlePauseToggle, handleSpeedChange, handleAddTable,
    handleRegularsClick, handleAcceptRegularNews, handleRejectRegularNews, handleShowReviews,
    handleOpenTrade, handleTradeGames, handleOpenCommunityNews,
    handleOpenManageRecommendList, handleSaveRecommendList, handleOpenGameRecommend, handleRecommendFromList,
  } = useGameEngine();

  // 어떤 모달을 보여줄지 결정하는 헬퍼 로직
  const getModalProps = () => {
    if (modalState.result) return {
      title: resultData.title,
      content: <ResultModalContent data={resultData} onClose={() => closeModal('result')} />
    };
    if (modalState.gamePurchase) return {
      title: TEXTS.modals.gamePurchase.title,
      content: <GamePurchaseModalContent availablePurchases={availablePurchases} onPurchaseGame={handlePurchaseGame} gamesManager={gamesManager} />
    };
    if (modalState.eventSelection) return {
      title: TEXTS.modals.eventSelection.title,
      content: <EventModalContent onExecuteEvent={executeEvent} />
    };
    if (modalState.event) return {
      title: TEXTS.modals.aiRecommend.title,
      content: <AIEventModalContent game={currentWeeklyGame} onAccept={handleAIAccept} onReject={handleAIReject} />
    };
    if (modalState.regularNews) return {
      title: '📰 단골손님 뉴스',
      content: <RegularNewsModalContent newsData={currentRegularNews} onAccept={handleAcceptRegularNews} onReject={handleRejectRegularNews} />
    };
    if (modalState.reviews) return {
      title: '⭐ 고객 리뷰',
      content: <ReviewsModalContent reviews={recentReviews} />
    };
    if (modalState.tradeGames) return {
      title: '🔄 중고거래',
      content: <TradeGamesModalContent
        ownedGames={uniqueGames}
        availablePurchases={availablePurchases}
        gamesManager={gamesManager}
        onTradeGames={handleTradeGames}
        onClose={() => closeModal('tradeGames')}
      />
    };
    if (modalState.communityNews) return {
      title: `📰 BGC 커뮤니티 소식 (Week ${currentWeek})`,
      content: <CommunityNewsModalContent
        currentWeek={currentWeek}
        currentNews={currentCommunityNews}
        ownedGames={uniqueGames}
        communityManager={communityManager}
      />
    };
    if (modalState.manageRecommendList) return {
      title: '⭐ 추천 게임 관리',
      content: <ManageRecommendListModalContent
        currentRecommendList={recommendList}
        ownedGames={uniqueGames}
        gamesManager={gamesManager}
        onSave={handleSaveRecommendList}
        onClose={() => closeModal('manageRecommendList')}
      />
    };
    if (modalState.gameRecommend) return {
      title: '🎲 게임 추천',
      content: <GameRecommendModalContent
        recommendList={recommendList}
        selectedTable={selectedTable}
        gamesManager={gamesManager}
        onRecommend={handleRecommendFromList}
      />
    };
    return { title: '', content: null };
  };

  const modalProps = getModalProps();
  const isAnyModalOpen = Object.values(modalState).some(Boolean);
  const isTableSelected = selectedTable !== null;

  // 보유 중인 트렌딩 게임 계산
  const ownedTrendingGames = uniqueGames.filter(game =>
    trendingGames.some(tg => tg.name === game.name)
  );

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white p-6 font-sans relative">

      {/* 🔒 테이블 선택 시 오버레이 */}
      {isTableSelected && !isAnyModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-10 pointer-events-none" />
      )}

      <div className="container mx-auto max-w-6xl relative z-20">

        {/* 🔒 테이블 선택 시 상단 배지 */}
        {isTableSelected && !isAnyModalOpen && (
          <div className="mb-4 flex justify-center">
            <div className="bg-blue-600/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-blue-400 animate-pulse">
              <span className="text-lg font-bold">⏸️ 게임 선택 중...</span>
            </div>
          </div>
        )}

        <Header />
        
        <StatsDisplay
          day={day}
          revenue={revenue}
          satisfaction={satisfaction}
          regulars={regulars}
          funds={funds}
          totalVisitors={totalVisitors}
          onPurchaseClick={() => openModal('gamePurchase')}
          onAddTableClick={handleAddTable}
          onRegularsClick={handleRegularsClick}
          onShowReviews={handleShowReviews}
          regularNewsBonus={regularNewsBonus}
          regularNewsBonusDays={regularNewsBonusDays}
          onDayClick={handleOpenCommunityNews}
          hasNewCommunityNews={hasNewCommunityNews}
        />

        {/* 🆕 활성 효과 표시 */}
        <ActiveBuffsDisplay
          buffs={buffManager.getActiveBuffs()}
          currentDay={day}
        />

        {/* 활성 효과 표시 (구버전) */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
          <h3 className="text-lg font-bold mb-3">✨ 활성 효과</h3>

          <div className="space-y-2">
            {/* 긍정적 효과 - 신규 방문자 부스트 */}
            {newVisitorBoost.active && newVisitorBoost.daysRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2">
                <span>📰</span>
                <span>신규 방문자 부스트: {newVisitorBoost.multiplier}배 증가</span>
                <span className="ml-auto text-xs text-gray-400">({newVisitorBoost.daysRemaining}일 남음)</span>
              </div>
            )}

            {/* 긍정적 효과 - 단골 뉴스 */}
            {regularNewsBonus > 0 && (
              <div className="flex items-center gap-2 text-sm bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                <span>📰</span>
                <span>단골 뉴스: 추천 성공률 +{regularNewsBonus}%</span>
                <span className="ml-auto text-xs text-gray-400">({regularNewsBonusDays}일 남음)</span>
              </div>
            )}

            {/* 긍정적 효과 - 트렌딩 게임 */}
            {ownedTrendingGames.length > 0 && (
              <div className="flex items-center gap-2 text-sm bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-2">
                <span>🔥</span>
                <span>트렌딩 게임 보유: 평점 하락 방지</span>
                <span className="ml-auto text-xs text-gray-400">({ownedTrendingGames.map(g => g.name).join(', ')})</span>
              </div>
            )}

            {/* 긍정적 효과 - 영구 이벤트 보너스 */}
            {permanentEventBonus > 0 && (
              <div className="flex items-center gap-2 text-sm bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2">
                <span>🎪</span>
                <span>이벤트 성공률 +{permanentEventBonus}%</span>
                <span className="ml-auto text-xs text-gray-400">(영구)</span>
              </div>
            )}

            {/* 긍정적 효과 - 영구 할인 */}
            {permanentDiscountRate > 0 && (
              <div className="flex items-center gap-2 text-sm bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-2">
                <span>💎</span>
                <span>게임 구매 할인 {permanentDiscountRate}%</span>
                <span className="ml-auto text-xs text-gray-400">(영구)</span>
              </div>
            )}

            {/* 긍정적 효과 - 완벽한 서비스 */}
            {perfectServiceBonus && (
              <div className="flex items-center gap-2 text-sm bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2">
                <span>⭐</span>
                <span>완벽한 서비스: 평점 상승 +10%</span>
                <span className="ml-auto text-xs text-gray-400">(모든 테이블 만족도 5)</span>
              </div>
            )}

            {/* 부정적 효과 - 낮은 평점 */}
            {satisfaction < 50 && (
              <div className="flex items-center gap-2 text-sm bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2">
                <span>⚠️</span>
                <span>낮은 평점: 신규 방문자 감소</span>
                <span className="ml-auto text-xs text-gray-400">(평점 5.0 미만)</span>
              </div>
            )}

            {/* 부정적 효과 - 자금 부족 */}
            {funds < 1000000 && (
              <div className="flex items-center gap-2 text-sm bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2">
                <span>💸</span>
                <span>자금 부족 경고</span>
                <span className="ml-auto text-xs text-gray-400">(100만원 미만)</span>
              </div>
            )}

            {/* 부정적 효과 - 불만족 손님 */}
            {tables.filter(t => t.occupied && t.satisfaction <= 2).length >= 2 && (
              <div className="flex items-center gap-2 text-sm bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2">
                <span>😞</span>
                <span>불만족 손님 다수: 단골 이탈 위험</span>
              </div>
            )}

            {/* 부정적 효과 - 게임 부족 */}
            {uniqueGames.length <= 3 && (
              <div className="flex items-center gap-2 text-sm bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-2">
                <span>🎲</span>
                <span>게임 부족: 다양성 감소</span>
                <span className="ml-auto text-xs text-gray-400">({uniqueGames.length}개)</span>
              </div>
            )}

            {/* 효과 없을 때 */}
            {!newVisitorBoost.active && !regularNewsBonus && !ownedTrendingGames.length && !permanentEventBonus && !permanentDiscountRate && !perfectServiceBonus &&
             satisfaction >= 50 && funds >= 1000000 && uniqueGames.length > 3 &&
             tables.filter(t => t.occupied && t.satisfaction <= 2).length < 2 && (
              <div className="text-center text-gray-400 text-sm py-2">
                현재 활성화된 특수 효과가 없습니다
              </div>
            )}
          </div>
        </div>

        <TablesGrid
          tables={tables}
          onTableClick={(table) => {
            handleTableClick(table);
            if (table && table.occupied) {
              handleOpenGameRecommend();
            }
          }}
          selectedTableId={selectedTable}
        />

        <OwnedGamesList
          games={uniqueGames}
          selectedTable={selectedTable}
          onGameClick={handleRecommendGame}
          gamesManager={gamesManager}
          onOpenTrade={handleOpenTrade}
          recommendList={recommendList}
          onOpenManageRecommendList={handleOpenManageRecommendList}
        />
        
        <ControlButtons
          isPaused={isPaused}
          gameSpeed={gameSpeed}
          onPauseToggle={handlePauseToggle}
          onSpeedChange={handleSpeedChange}
        />
        
        {/* 재사용 가능한 Modal 컴포넌트가 활성화된 모달의 내용물을 렌더링합니다 */}
        <Modal
          isOpen={isAnyModalOpen}
          onClose={() => closeModal(Object.keys(modalState).find(key => modalState[key]))}
          title={modalProps.title}
        >
          {modalProps.content}
        </Modal>

      </div>
    </div>
  );
};

export default BoardGameCafe;
