import React from 'react';
import { Piece } from '../types';
import { Cell } from './Cell';

interface NextPiecePreviewProps {
  piece: Piece | null;
}

const NextPiecePreview: React.FC<NextPiecePreviewProps> = ({ piece }) => {
  const gridSize = 4; // Max size for any piece preview
  const previewGrid: (string | 0)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0));

  if (piece) {
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          // Center the piece in the preview grid
          const previewY = y + Math.floor((gridSize - piece.shape.length) / 2);
          const previewX = x + Math.floor((gridSize - row.length) / 2);
          if (previewGrid[previewY] && previewGrid[previewY][previewX] !== undefined) {
             previewGrid[previewY][previewX] = piece.color;
          }
        }
      });
    });
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Next</h3>
      <div
        className="grid border border-gray-700"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          width: '100px', 
          height: '100px', 
        }}
      >
        {previewGrid.map((row, y) =>
          row.map((cellColor, x) => (
            <Cell key={`preview-${y}-${x}`} type={cellColor} />
          ))
        )}
      </div>
    </div>
  );
};

export default NextPiecePreview;
