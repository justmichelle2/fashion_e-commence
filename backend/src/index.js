require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./models');
const socketHandler = require('./utils/socketHandler');

// Try the PORT env, otherwise start at 5000 and increment if in use
const START_PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully - Restarted');
    await sequelize.sync(); // sync models

    let port = START_PORT;
    const maxAttempts = 20;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Create HTTP server
        const server = http.createServer(app);

        // Setup Socket.io
        const io = new Server(server, {
          cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
          }
        });

        // Initialize socket handlers
        const socketHandlerInstance = socketHandler(io);

        // Make io and socketHandler accessible in routes
        app.set('io', io);
        app.set('socketHandler', socketHandlerInstance);

        // Wrap listen in a promise so we can catch asynchronous 'error' events
        await new Promise((resolve, reject) => {
          server.listen(port, HOST, () => {
            const addr = server.address();
            console.log(`Server running on port ${addr.port} (bound to ${addr.address})`);
            console.log('Socket.io initialized');
            // register an error logger but do not reject here (listen succeeded)
            server.on('error', (err) => {
              console.error('Server error:', err);
            });
            resolve();
          });

          // If an error occurs while binding, reject so we can try the next port
          server.on('error', (err) => {
            reject(err);
          });
        });

        // success — exit the start function
        return;
      } catch (err) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} in use, trying port ${port + 1}...`);
          port += 1;
          continue;
        }
        throw err;
      }
    }

    throw new Error(`Unable to bind to a port in range ${START_PORT}-${START_PORT + maxAttempts}`);
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
