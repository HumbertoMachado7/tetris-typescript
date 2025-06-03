import React from 'react';
import TetrisGame from './components/TetrisGame'; // Asegúrate que la ruta sea correcta

const App: React.FC = () => {
  return (
    // Este div ahora se centrará gracias a los estilos de #root en index.html
    // Podemos quitarle el min-h-screen y el flex específico si #root ya lo hace.
    // Lo dejaremos flexible para que se adapte al contenido de TetrisGame.
    <div className="flex flex-col items-center p-2 sm:p-4 text-white w-full"> {/* Quitado min-h-screen, justify-center, bg-gray-900 */}
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        React Tetris Classic
      </h1>
      <TetrisGame />
    </div>
  );
};

export default App;