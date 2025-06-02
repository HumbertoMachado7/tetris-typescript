
import React from 'react';

interface GameControlsProps {
  onPauseToggle: () => void;
  onRestart: () => void;
  isPaused: boolean;
  isGameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onPauseToggle, onRestart, isPaused, isGameOver }) => {
  return (
    <div className="mt-4 space-y-3 w-full">
      {!isGameOver && (
         <button
         onClick={onPauseToggle}
         className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
       >
         {isPaused ? 'Resume' : 'Pause'} (P)
       </button>
      )}
      <button
        onClick={onRestart}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
      >
        {isGameOver ? 'Play Again' : 'Restart'} (R)
      </button>
    </div>
  );
};

export default GameControls;
