// tailwind.config.js
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  content: [path.join(__dirname, './src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#0a9370' },
        plai: { orange: '#f97316' }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
}
