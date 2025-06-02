
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './Board';
import NextPiecePreview from './NextPiecePreview';
import ScoreDisplay from './ScoreDisplay';
import GameControls from './GameControls';
import GameOverModal from './GameOverModal';
import { BoardShape, Piece, TetrominoType, CellValue } from '../types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  TETROMINO_TYPES,
  INITIAL_SPEED,
  SPEED_DECREMENT,
  MIN_SPEED,
  LINES_PER_LEVEL,
  SCORE_POINTS
} from '../constants';
import { useGameSounds } from '../hooks/useGameSounds';

const createEmptyBoard = (): BoardShape =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const getRandomPiece = (): Piece => {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  const tetromino = TETROMINOES[type];
  return {
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0,
    shape: tetromino.shape,
    color: tetromino.color,
  };
};

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<BoardShape>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(getRandomPiece());
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { playMoveSound, playRotateSound, playLineClearSound, playDropSound, playHardDropSound, playGameOverSound, playPauseSound } = useGameSounds();

  const checkCollision = useCallback((piece: Piece, boardToCheck: BoardShape): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newY = piece.y + y;
          const newX = piece.x + x;
          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            (boardToCheck[newY] && boardToCheck[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);


  const spawnNewPiece = useCallback(() => {
    if (!nextPiece) return; // Should not happen if initialized correctly
    const newPiece = nextPiece;
    setCurrentPiece(newPiece);
    setNextPiece(getRandomPiece());
    if (checkCollision(newPiece, board)) {
      setIsGameOver(true);
      playGameOverSound();
    }
  }, [nextPiece, board, checkCollision, playGameOverSound]);

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color as CellValue;
        }
      });
    });

    // Clear lines
    let linesToClear = 0;
    for (let y = newBoard.length - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesToClear++;
        y++; // Re-check the current row index as it's now a new row
      }
    }

    if (linesToClear > 0) {
      playLineClearSound();
      setLinesCleared(prev => prev + linesToClear);
      let points = 0;
      if (linesToClear === 1) points = SCORE_POINTS.SINGLE;
      else if (linesToClear === 2) points = SCORE_POINTS.DOUBLE;
      else if (linesToClear === 3) points = SCORE_POINTS.TRIPLE;
      else if (linesToClear >= 4) points = SCORE_POINTS.TETRIS;
      setScore(prev => prev + points * (level + 1));
    }
    
    setBoard(newBoard);
    spawnNewPiece();
  }, [currentPiece, board, spawnNewPiece, level, playLineClearSound]);


  const movePiece = useCallback((deltaX: number, deltaY: number): boolean => {
    if (!currentPiece || isPaused || isGameOver) return false;
    const newPiece = { ...currentPiece, x: currentPiece.x + deltaX, y: currentPiece.y + deltaY };
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
      if (deltaY > 0) playDropSound(); else playMoveSound();
      return true;
    } else if (deltaY > 0) { // Collision moving down means lock piece
      lockPiece();
    }
    return false;
  }, [currentPiece, isPaused, isGameOver, checkCollision, board, lockPiece, playDropSound, playMoveSound]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    const originalShape = currentPiece.shape;
    const newShape = originalShape[0].map((_, colIndex) =>
      originalShape.map(row => row[colIndex]).reverse()
    );
    const newPiece = { ...currentPiece, shape: newShape };
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
      playRotateSound();
    } else {
      // Basic wall kick attempt (try moving 1 step left/right)
      const kickOffsets = [0, 1, -1, 2, -2]; // Try original, then kick
      for (const offset of kickOffsets) {
        if (offset === 0) continue; // already tried
        const kickedPiece = { ...newPiece, x: newPiece.x + offset };
        if (!checkCollision(kickedPiece, board)) {
          setCurrentPiece(kickedPiece);
          playRotateSound();
          return;
        }
      }
    }
  }, [currentPiece, isPaused, isGameOver, checkCollision, board, playRotateSound]);
  
  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    let pieceToDrop = {...currentPiece};
    while (!checkCollision({...pieceToDrop, y: pieceToDrop.y + 1}, board)) {
      pieceToDrop.y += 1;
    }
    setCurrentPiece(pieceToDrop); // Set final position before locking
    lockPiece(); // Lock immediately
    playHardDropSound();
  }, [currentPiece, isPaused, isGameOver, checkCollision, board, lockPiece, playHardDropSound]);


  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPiece(null); // Will be set by spawnNewPiece
    setNextPiece(getRandomPiece()); // Prime the next piece
    setScore(0);
    setLinesCleared(0);
    setLevel(0);
    setGameSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPaused(false);
    spawnNewPiece(); // This will set the first currentPiece
    if(gameContainerRef.current) gameContainerRef.current.focus();
  }, [spawnNewPiece]);

  const togglePause = useCallback(() => {
    if (isGameOver) return;
    setIsPaused(prev => !prev);
    playPauseSound();
    if(gameContainerRef.current) gameContainerRef.current.focus();
  }, [isGameOver, playPauseSound]);

  // Game loop
  useEffect(() => {
    if (isGameOver || isPaused || !currentPiece) return;
    const timer = setTimeout(() => {
      movePiece(0, 1);
    }, gameSpeed);
    return () => clearTimeout(timer);
  }, [currentPiece, gameSpeed, isGameOver, isPaused, movePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isGameOver && event.key !== 'r' && event.key !== 'R') return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (!isPaused) movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!isPaused) movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (!isPaused) movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (!isPaused) rotatePiece();
          break;
        case ' ': // Space for hard drop
           if (!isPaused) hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
        case 'r':
        case 'R':
          startGame();
          break;
      }
    };

    // Focus the game container to receive key events
    if(gameContainerRef.current) gameContainerRef.current.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, movePiece, rotatePiece, hardDrop, togglePause, startGame]);

  // Update level and speed
  useEffect(() => {
    if (linesCleared >= LINES_PER_LEVEL) {
      const newLevel = level + Math.floor(linesCleared / LINES_PER_LEVEL);
      setLevel(newLevel);
      setLinesCleared(prev => prev % LINES_PER_LEVEL);
      setGameSpeed(Math.max(MIN_SPEED, INITIAL_SPEED - newLevel * SPEED_DECREMENT));
    }
  }, [linesCleared, level]);

  // Initialize game
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Combine current piece with board for rendering
  const displayBoard = useCallback(() => {
    const newDisplayBoard = board.map(row => [...row]);
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >=0 && boardX < BOARD_WIDTH) {
                 newDisplayBoard[boardY][boardX] = currentPiece.color as CellValue;
            }
          }
        });
      });
    }
    return newDisplayBoard;
  }, [board, currentPiece]);


  return (
    <div ref={gameContainerRef} tabIndex={0} className="outline-none flex flex-col md:flex-row items-start justify-center p-4 md:p-8 gap-4 md:gap-8 bg-gray-900 rounded-xl shadow-2xl">
      <Board board={displayBoard()} />
      <div className="w-full md:w-48 flex flex-col space-y-4">
        <ScoreDisplay score={score} lines={linesCleared + level * LINES_PER_LEVEL} level={level} />
        {nextPiece && <NextPiecePreview piece={nextPiece} />}
        <GameControls onPauseToggle={togglePause} onRestart={startGame} isPaused={isPaused} isGameOver={isGameOver} />
         <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-800 rounded">
            <p>Controls:</p>
            <p>Arrows/WASD: Move/Rotate</p>
            <p>Space: Hard Drop</p>
            <p>P: Pause/Resume</p>
            <p>R: Restart</p>
        </div>
      </div>
      {isGameOver && <GameOverModal score={score} onRestart={startGame} />}
    </div>
  );
};

export default TetrisGame;
