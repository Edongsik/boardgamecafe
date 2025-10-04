// src/components/TablesGrid.jsx

import React from 'react';
import { TEXTS } from '../data/textData';

const TableCard = ({ table, onTableClick, isSelected }) => {
  let statusClass = 'bg-gradient-to-br from-gray-600 to-gray-700';
  let statusIcon = '🪑';
  let statusText = '빈 테이블';

  if (table.occupied) {
    if (table.status === 'happy') {
      statusClass = 'bg-gradient-to-br from-green-600 to-emerald-600';
      statusIcon = '😊';
      statusText = table.game;
    } else if (table.status === 'confused') {
      statusClass = 'bg-gradient-to-br from-yellow-600 to-orange-600';
      statusIcon = '😕';
      statusText = `${table.game} (어려워함)`;
    } else if (table.status === 'unhappy') {
      statusClass = 'bg-gradient-to-br from-red-600 to-pink-600';
      statusIcon = '😠';
      statusText = `${table.game} (불만족)`;
    }
  }

  const borderClass = isSelected ? 'ring-4 ring-blue-500' : '';

  return (
    <div
      className={`${statusClass} ${borderClass} rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-all duration-300`}
      onClick={() => onTableClick(table)}
    >
      <div className="text-3xl mb-2">{statusIcon}</div>
      <div className="font-bold">테이블 {table.id}</div>
      <div className="text-sm mt-1">{statusText}</div>
      {table.satisfaction > 0 && (
        <div className="text-xs mt-1">만족도: {table.satisfaction}/5</div>
      )}
      <div className="text-xs mt-1 text-cyan-300">
        {table.occupied ? (isSelected ? '선택됨 ✓' : '클릭하여 선택') : '클릭하여 이벤트 열기'}
      </div>
    </div>
  );
};

const TablesGrid = ({ tables, onTableClick, selectedTableId }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{TEXTS.ui.tables}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onTableClick={onTableClick}
            isSelected={table.id === selectedTableId}
          />
        ))}
      </div>
    </div>
  );
};

export default TablesGrid;