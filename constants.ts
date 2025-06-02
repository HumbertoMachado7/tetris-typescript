
import { Shapes, TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES: Shapes = {
  '0': { shape: [[0]], color: 'bg-transparent' }, // Represents an empty cell or no piece
  'I': {
    shape: [[1, 1, 1, 1]],
    color: 'bg-cyan-400',
  },
  'J': {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: 'bg-blue-500',
  },
  'L': {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: 'bg-orange-500',
  },
  'O': {
    shape: [[1, 1], [1, 1]],
    color: 'bg-yellow-400',
  },
  'S': {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: 'bg-green-500',
  },
  'T': {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: 'bg-purple-500',
  },
  'Z': {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: 'bg-red-500',
  },
};

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export const INITIAL_SPEED = 1000; // ms
export const SPEED_DECREMENT = 50; // ms per level
export const MIN_SPEED = 100; // ms
export const LINES_PER_LEVEL = 10;

export const SCORE_POINTS = {
  SINGLE: 40,
  DOUBLE: 100,
  TRIPLE: 300,
  TETRIS: 1200,
};
