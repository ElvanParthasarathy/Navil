import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Adapter to make Vite Request/Response look like Vercel Serverless Function
const vercelAdapter = async (req, res, handler) => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  try {
    req.body = JSON.parse(data);
  } catch {
    req.body = {};
  }

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };

  await handler(req, res);
};

export default defineConfig(({ mode }) => {
  // Load env vars into process.env so the handler can access them
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html')
        }
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-api-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/saveData' && req.method === 'POST') {
              try {
                console.log('Intercepting /api/saveData locally...');
                const { default: handler } = await import('./api/saveData.js');
                await vercelAdapter(req, res, handler);
              } catch (error) {
                console.error('Local API Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Local Server Error' }));
              }
            } else if (req.url === '/admin' || req.url?.startsWith('/admin/')) {
              req.url = '/admin.html';
              next();
            } else {
              next();
            }
          });
        }
      }
    ],
  };
});
