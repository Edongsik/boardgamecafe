import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // 전체 화면을 덮는 반투명 배경 (오버레이)
<div 
  className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
  onClick={onClose}
>
      {/* 실제 모달 컨텐츠 박스 */}
      <div
        className="bg-gradient-to-br from-gray-800 via-slate-900 to-gray-900 rounded-2xl p-6 md:p-8 max-w-lg w-full mx-4 border border-white/20 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()} // 컨텐츠 영역 클릭 시 창이 닫히는 것을 방지
      >
        {/* 모달 제목과 닫기 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-4xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* 모달의 실제 내용이 이 부분에 렌더링됩니다. */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
