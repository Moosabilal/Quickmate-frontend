import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion') || id.includes('@popperjs') || id.includes('react-transition-group')) {
              return 'vendor-mui';
            }

            if (id.includes('recharts') || id.includes('d3') || id.includes('lodash') || id.includes('react-smooth')) {
              return 'vendor-charts';
            }

            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-leaflet';
            if (id.includes('jspdf')) return 'vendor-jspdf';
            if (id.includes('html2canvas')) return 'vendor-html2canvas';

            if (id.includes('socket.io')) return 'vendor-socket';

            if (id.includes('react-big-calendar') || id.includes('react-day-picker') || id.includes('date-fns') || id.includes('dayjs')) {
              return 'vendor-calendar';
            }

            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('@heroicons')) {
              return 'vendor-icons';
            }

            if (id.includes('/react/') || id.includes('react-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-react';
            }

            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('zustand')) {
              return 'vendor-state';
            }

            if (id.includes('gapi-script') || id.includes('@react-oauth')) {
              return 'vendor-auth';
            }

            return 'vendor-core';
          }
        }
      }
    }
  }
})
