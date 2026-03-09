import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // ONLY isolate the massive libraries that cause the 500kb warning.
            
            // 1. Material UI & Styling
            if (id.includes('@mui') || id.includes('@emotion') || id.includes('@popperjs') || id.includes('react-transition-group')) {
              return 'vendor-mui';
            }
            
            // 2. Charts & its dependencies
            if (id.includes('recharts') || id.includes('d3') || id.includes('lodash') || id.includes('react-smooth')) {
              return 'vendor-charts';
            }
            
            // 3. Maps & PDFs
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-leaflet';
            if (id.includes('jspdf')) return 'vendor-jspdf';
            if (id.includes('html2canvas')) return 'vendor-html2canvas';
            
            // 4. WebSockets
            if (id.includes('socket.io')) return 'vendor-socket';

            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('@heroicons')) {
              return 'vendor-icons';
            }

            // 6. Calendars & Dates (Safe to separate, drops ~65kb)
            if (id.includes('react-big-calendar') || id.includes('react-day-picker') || id.includes('date-fns') || id.includes('dayjs')) {
              return 'vendor-calendar';
            }

            // By NOT manually chunking react, redux, icons, etc., 
            // Vite will safely bundle them together in the right order.
            // Because we removed MUI, Charts, and PDFs, the main chunk will still be under 500kb!
          }
        }
      }
    }
  }
})
