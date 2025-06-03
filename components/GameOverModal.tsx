import React, { useEffect, useRef } from 'react';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart }) => {
  const playAgainButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (playAgainButtonRef.current) {
      playAgainButtonRef.current.focus();
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center p-4 z-50">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
        <p className="text-lg sm:text-xl text-white mb-6">Your Score: {score}</p>
        <button
          ref={playAgainButtonRef}
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;