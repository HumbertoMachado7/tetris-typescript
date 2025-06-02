
import React from 'react';
import { BoardShape } from '../types';
import { Cell } from './Cell';

interface BoardProps {
  board: BoardShape;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <div
      className="grid border-2 border-gray-600 bg-gray-900 shadow-2xl"
      style={{
        gridTemplateColumns: `repeat(${board[0]?.length || 10}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${board.length}, minmax(0, 1fr))`,
        width: '250px', // Approx 25px per cell for 10 cells
        height: '500px', // Approx 25px per cell for 20 cells
      }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell} />)
      )}
    </div>
  );
};

export default Board;
