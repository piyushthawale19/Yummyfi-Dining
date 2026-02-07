import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    
    publicDir: 'public',
    
    server: {
      port: 5173,
      fs: {
        // Prevent serving files from the api directory
        deny: ['**/api/**']
      }
    },
    
    // Custom middleware to handle API routes during development
    configureServer(server) {
      // Add middleware at the beginning to intercept /api requests
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/imagekit-auth') {
            // Enable CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

            // Handle preflight request
            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }

            try {
              // Use env loaded from .env file
              const privateKey = env.IMAGEKIT_PRIVATE_KEY;

              console.log('🔐 ImageKit auth request received');
              console.log('📝 Private key exists:', !!privateKey);
              console.log('📝 Private key value:', privateKey ? `${privateKey.substring(0, 15)}...` : 'undefined');

              if (!privateKey || privateKey === 'your_private_key_here') {
                console.error('❌ IMAGEKIT_PRIVATE_KEY not configured');
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'IMAGEKIT_PRIVATE_KEY not found in .env file.\n\n' +
                         'Please add: IMAGEKIT_PRIVATE_KEY=your_private_key_here\n\n' +
                         'Then restart the dev server: npm run dev'
                }));
                return;
              }

              // Generate authentication parameters
              const token = crypto.randomBytes(16).toString('hex');
              const expire = Math.floor(Date.now() / 1000) + 2400;
              const signature = crypto
                .createHmac('sha1', privateKey)
                .update(token + expire)
                .digest('hex');

              console.log('✅ ImageKit auth generated successfully');
              console.log('Token:', token.substring(0, 10) + '...');
              console.log('Expire:', expire);
              console.log('Signature:', signature.substring(0, 10) + '...');
              
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                token,
                expire,
                signature,
              }));
            } catch (error) {
              console.error('❌ Error generating ImageKit auth:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: 'Failed to generate authentication parameters',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
              }));
            }
          } else {
            next();
          }
        });
      };
    }
  };
});
