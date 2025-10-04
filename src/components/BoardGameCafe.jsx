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
    communityManager,

    // 자식 컴포넌트에 전달할 함수들
    openModal, closeModal, handleTableClick, handlePurchaseGame,
    handleRecommendGame, executeEvent, handleAIAccept, handleAIReject,
    handlePauseToggle, handleSpeedChange, handleAddTable,
    handleRegularsClick, handleAcceptRegularNews, handleRejectRegularNews, handleShowReviews,
    handleOpenTrade, handleTradeGames, handleOpenCommunityNews,
  } = useGameEngine();

  // 어떤 모달을 보여줄지 결정하는 헬퍼 로직
  const getModalProps = () => {
    if (modalState.result) return {
      title: resultData.title,
      content: <ResultModalContent data={resultData} onClose={() => closeModal('result')} />
    };
    if (modalState.gamePurchase) return {
      title: TEXTS.modals.gamePurchase.title,
      content: <GamePurchaseModalContent availablePurchases={availablePurchases} onPurchaseGame={handlePurchaseGame} />
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
    return { title: '', content: null };
  };

  const modalProps = getModalProps();
  const isAnyModalOpen = Object.values(modalState).some(Boolean);
  const isTableSelected = selectedTable !== null;

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
        
        <TablesGrid
          tables={tables}
          onTableClick={handleTableClick}
          selectedTableId={selectedTable}
        />

        <OwnedGamesList
          games={uniqueGames}
          selectedTable={selectedTable}
          onGameClick={handleRecommendGame}
          gamesManager={gamesManager}
          onOpenTrade={handleOpenTrade}
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
