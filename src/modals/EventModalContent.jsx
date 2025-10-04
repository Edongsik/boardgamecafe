import React from 'react';
import { TEXTS } from '../data/textData';
import { ECONOMY_CONFIG } from '../config/gameConfig';

const EventButton = ({ icon, eventType, onExecuteEvent }) => {
  const eventText = TEXTS.modals.eventSelection[eventType];
  const cost = ECONOMY_CONFIG.EVENT_COSTS[eventType];

  const colorClasses = {
    sns: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    tournament: 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
    discount: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
  };

  return (
    <button
      onClick={() => onExecuteEvent(eventType)}
      className={`w-full bg-gradient-to-r ${colorClasses[eventType]} py-3 rounded-xl font-bold transition-all text-left px-4`}
    >
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <div className="font-bold">{eventText.title}</div>
          <div className="text-sm opacity-80">{eventText.desc(cost)}</div>
        </div>
      </div>
    </button>
  );
};

const EventModalContent = ({ onExecuteEvent }) => {
  return (
    <div>
      <p className="text-gray-300 mb-6">{TEXTS.modals.eventSelection.description}</p>
      <div className="space-y-4">
        <EventButton icon="📱" eventType="sns" onExecuteEvent={onExecuteEvent} />
        <EventButton icon="🏆" eventType="tournament" onExecuteEvent={onExecuteEvent} />
        <EventButton icon="💰" eventType="discount" onExecuteEvent={onExecuteEvent} />
      </div>
    </div>
  );
};

export default EventModalContent;
