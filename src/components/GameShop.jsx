// src/components/GameShop.jsx

import React from 'react';

// App 컴포넌트에서 전달해준 purchasableGames를 props로 받습니다.
function GameShop({ purchasableGames }) {

  // 데이터가 없거나 비어있을 경우를 대비한 UI
  if (!purchasableGames || purchasableGames.length === 0) {
    return (
      <section className="gameshop-container">
        <h2>게임 구매</h2>
        <p>구매할 수 있는 게임이 없습니다.</p>
      </section>
    );
  }

  // 전달받은 데이터를 사용해 게임 목록을 화면에 그립니다.
  return (
    <section className="gameshop-container">
      <h2>게임 구매</h2>
      <p>새로운 보드게임을 구매하여 카페를 업그레이드하세요!</p>
      <div className="game-list">
        {purchasableGames.map(game => (
          <div key={game.id} className="game-item">
            <span>🎲 {game.name}</span>
            <span>₩{game.price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default GameShop;