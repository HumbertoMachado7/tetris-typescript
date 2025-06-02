export type CellValue = string | 0; // 0 for empty, string for color class
export type BoardShape = CellValue[][];

export interface TetrominoShape {
  shape: number[][];
  color: string; // Tailwind CSS background color class
}

export interface Piece {
  x: number;
  y: number;
  shape: number[][];
  color: string;
}

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Shapes {
  [key: string]: TetrominoShape;
}