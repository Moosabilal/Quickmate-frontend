import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // server: {
  //   allowedHosts: true, 
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000',
  //       changeOrigin: true,
  //       secure: false,
  //       // // The Magic Trick: Force the Origin header to match what the backend expects
  //       // configure: (proxy) => {
  //       //   proxy.on('proxyReq', (proxyReq) => {
  //       //     proxyReq.setHeader('Origin', 'http://localhost:5173');
  //       //   });
  //       // }
  //     },
  //   },
  // },
})
