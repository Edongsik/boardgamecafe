import React from 'react';
import { TEXTS } from '../data/textData';
import { RESULT_ICONS } from '../utils/constants';

const ResultModalContent = ({ data, onClose }) => {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">{RESULT_ICONS[data.type]}</div>
      <p className="text-gray-300 whitespace-pre-line">{data.content}</p>
      {data.warning && (
        <p className="text-yellow-300 text-sm mt-2">{data.warning}</p>
      )}
      <button 
        onClick={onClose} 
        className="w-full mt-6 bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-bold transition-colors"
      >
        {TEXTS.ui.confirm}
      </button>
    </div>
  );
};

export default ResultModalContent;