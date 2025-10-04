import React from 'react';
import { TEXTS } from '../data/textData'; // textData 파일의 상대 경로

const Header = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
        {TEXTS.header.title}
      </h1>
      <p className="text-lg text-gray-300">{TEXTS.header.subtitle}</p>
    </div>
  );
};

export default Header;