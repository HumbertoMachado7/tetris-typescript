
import React from 'react';
import TetrisGame from './components/TetrisGame';

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-bold mb-6 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        React Tetris Classic
      </h1>
      <TetrisGame />
    </div>
  );
};

export default App;
