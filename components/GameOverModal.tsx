import React from 'react';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
        <p className="text-xl text-gray-300 mb-2">Your Score: {score}</p>
        <button
          onClick={onRestart}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;