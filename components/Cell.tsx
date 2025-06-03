import React from 'react';
import { CellValue } from '../types';

interface CellProps {
  type: CellValue;
}

const CellComponent: React.FC<CellProps> = ({ type }) => {
  const cellStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: type === 0 ? '#1f2937' : type,
    border: '1px solid #374151',
  };

  return <div style={cellStyle} />;
};

export const Cell = React.memo(CellComponent);