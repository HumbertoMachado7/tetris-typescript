import React from 'react';

interface ScoreDisplayProps {
  score: number;
  lines: number;
  level: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, lines, level }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-gray-300 space-y-2 w-full">
      <div className="flex justify-between">
        <span className="font-semibold">Score:</span>
        <span>{score}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Lines:</span>
        <span>{lines}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Level:</span>
        <span>{level}</span>
      </div>
    </div>
  );
};

export default ScoreDisplay;