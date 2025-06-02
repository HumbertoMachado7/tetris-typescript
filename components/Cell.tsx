
import React from 'react';
import { CellValue } from '../types';

interface CellProps {
  type: CellValue;
}

const CellComponent: React.FC<CellProps> = ({ type }) => {
  const color = type === 0 ? 'bg-gray-800' : type;
  return <div className={`w-full h-full border border-gray-700 ${color}`}></div>;
};

export const Cell = React.memo(CellComponent);
