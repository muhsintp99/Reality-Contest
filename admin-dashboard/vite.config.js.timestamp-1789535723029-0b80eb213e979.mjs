// vite.config.js
import { defineConfig } from "file:///C:/Users/ADMIN/Desktop/BLG-%20sponcer/admin-dashboard/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ADMIN/Desktop/BLG-%20sponcer/admin-dashboard/node_modules/@vitejs/plugin-react/dist/index.js";
import dns from "dns";
dns.setDefaultResultOrder("verbatim");
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  server: {
    host: true,
    allowedHosts: true,
    port: 10002,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 10002
    },
    proxy: {
      "/api": {
        // target: process.env.VITE_API_TARGET || 'https://api.hakalive.in',
        target: process.env.VITE_API_TARGET || "http://localhost:10000/api",
        changeOrigin: true,
        secure: false
      },
      "/api-docs": {
        // target: process.env.VITE_API_TARGET || 'https://api.hakalive.in',
        target: process.env.VITE_API_TARGET || "http://localhost:10000/api",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: (process.env.VITE_API_TARGET || "http://localhost:10000").replace(/\/api\/?$/, ""),
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: true,
    allowedHosts: true,
    port: 10002
  },
  build: {
    chunkSizeWarningLimit: 1600
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBRE1JTlxcXFxEZXNrdG9wXFxcXEJMRy0gc3BvbmNlclxcXFxhZG1pbi1kYXNoYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFETUlOXFxcXERlc2t0b3BcXFxcQkxHLSBzcG9uY2VyXFxcXGFkbWluLWRhc2hib2FyZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQURNSU4vRGVza3RvcC9CTEctJTIwc3BvbmNlci9hZG1pbi1kYXNoYm9hcmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IGRucyBmcm9tICdkbnMnXG5cbi8vIEZvcmNlIGRucyB0byB1c2UgdmVyYmF0aW0gb3JkZXIsIGF2b2lkaW5nIElQdjYvSVB2NCBtaXNtYXRjaCBmb3IgbG9jYWxob3N0IEhNUlxuZG5zLnNldERlZmF1bHRSZXN1bHRPcmRlcigndmVyYmF0aW0nKVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgZGVkdXBlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IHRydWUsXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICAgIHBvcnQ6IDEwMDAyLFxuICAgIGhtcjoge1xuICAgICAgcHJvdG9jb2w6ICd3cycsXG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICAgIHBvcnQ6IDEwMDAyXG4gICAgfSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIC8vIHRhcmdldDogcHJvY2Vzcy5lbnYuVklURV9BUElfVEFSR0VUIHx8ICdodHRwczovL2FwaS5oYWthbGl2ZS5pbicsXG4gICAgICAgIHRhcmdldDogcHJvY2Vzcy5lbnYuVklURV9BUElfVEFSR0VUIHx8ICdodHRwOi8vbG9jYWxob3N0OjEwMDAwL2FwaScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICAnL2FwaS1kb2NzJzoge1xuICAgICAgICAvLyB0YXJnZXQ6IHByb2Nlc3MuZW52LlZJVEVfQVBJX1RBUkdFVCB8fCAnaHR0cHM6Ly9hcGkuaGFrYWxpdmUuaW4nLFxuICAgICAgICB0YXJnZXQ6IHByb2Nlc3MuZW52LlZJVEVfQVBJX1RBUkdFVCB8fCAnaHR0cDovL2xvY2FsaG9zdDoxMDAwMC9hcGknLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgJy91cGxvYWRzJzoge1xuICAgICAgICB0YXJnZXQ6IChwcm9jZXNzLmVudi5WSVRFX0FQSV9UQVJHRVQgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6MTAwMDAnKS5yZXBsYWNlKC9cXC9hcGlcXC8/JC8sICcnKSxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcHJldmlldzoge1xuICAgIGhvc3Q6IHRydWUsXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICAgIHBvcnQ6IDEwMDAyXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxNjAwXG4gIH1cbn0pXG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVYsU0FBUyxvQkFBb0I7QUFDdFgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUdoQixJQUFJLHNCQUFzQixVQUFVO0FBR3BDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsRUFDL0I7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxJQUNkLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUE7QUFBQSxRQUVOLFFBQVEsUUFBUSxJQUFJLG1CQUFtQjtBQUFBLFFBQ3ZDLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxhQUFhO0FBQUE7QUFBQSxRQUVYLFFBQVEsUUFBUSxJQUFJLG1CQUFtQjtBQUFBLFFBQ3ZDLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixTQUFTLFFBQVEsSUFBSSxtQkFBbUIsMEJBQTBCLFFBQVEsYUFBYSxFQUFFO0FBQUEsUUFDekYsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
