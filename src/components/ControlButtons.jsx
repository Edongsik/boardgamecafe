// src/components/ControlButtons.jsx

import React from 'react';
import { TEXTS } from '../data/textData';
import { TIME_CONFIG } from '../config/gameConfig';

const ControlButtons = ({ isPaused, gameSpeed, onPauseToggle, onSpeedChange }) => {
  return (
    <div className="text-center mb-8">
      <button
        onClick={onPauseToggle}
        className={`${
          !isPaused
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
            : 'bg-gradient-to-r from-green-500 to-emerald-500'
        } hover:opacity-90 px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all mr-4`}
      >
        {!isPaused ? TEXTS.ui.pause : TEXTS.ui.resume}
      </button>
      <button
        onClick={onSpeedChange}
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all"
      >
        {gameSpeed === 1 ? TEXTS.ui.speedUp : TEXTS.ui.speedDown}
      </button>
    </div>
  );
};

export default ControlButtons;