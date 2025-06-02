import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // <--- IMPORTANTE: Importar el plugin de React

export default defineConfig(({ mode }) => {
    // Cargar variables de entorno del archivo .env en la raíz del proyecto
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
      plugins: [
        react() // <--- IMPORTANTE: Añadir el plugin de React aquí
      ],
      define: {
        // Esto hace que las variables de entorno estén disponibles en tu código cliente
        // This makes a .env variable available in your client-side code
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Puedes tener solo una si son la misma, o diferenciar si es necesario
        // You can have just one if they are the same, or differentiate if needed
        // 'process.env.API_KEY': JSON.stringify(env.API_KEY_SOME_OTHER_SERVICE)
      },
      resolve: {
        alias: {
          // Define un alias para la raíz del proyecto
          // Defines an alias for the project root
          '@': path.resolve(__dirname, './src'), // Comúnmente se apunta a 'src' si tienes esa carpeta
                                                // Commonly points to 'src' if you have such a folder
                                                // Si tu código principal está en la raíz, puedes dejar '.'
                                                // If your main code is in the root, you can leave '.'
        }
      },
      server: {
        port: 3000, // Opcional: define un puerto específico para el servidor de desarrollo
                    // Optional: define a specific port for the development server
        open: true    // Opcional: abre automáticamente el navegador cuando inicias el servidor
                    // Optional: automatically opens the browser when you start the server
      }
    };
});