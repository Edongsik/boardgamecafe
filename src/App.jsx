import React from 'react';
import './App.css'; // App.css 전역 스타일 적용
import BoardGameCafe from './components/BoardGameCafe'; // 실제 게임 컴포넌트

function App() {
  return (
    <div className="App">
      <BoardGameCafe />
    </div>
  );
}

export default App;
