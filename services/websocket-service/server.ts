import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 4000;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health Check
  if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'EduPress Real-Time WebSocket Notification Service (Concept #24)',
        port: PORT,
        connectedSockets: io.sockets.sockets.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Webhook 1: Trigger Instructor Blog Notification
  if (req.method === 'POST' && req.url === '/notify/blog') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const blogNotification = {
          id: `notif_blog_${Date.now()}`,
          type: 'BLOG_POSTED',
          title: payload.title || 'New Instructor Blog Published',
          author: payload.author || 'Senior Instructor',
          desc: payload.desc || 'Check out the latest industry insights and tutorials.',
          category: payload.category || 'Tech Trends',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        // Broadcast real-time push to all connected students
        io.emit('notification:new_blog', blogNotification);
        console.log(`📢 \x1b[32m[WebSocket PUSH]\x1b[0m Broadcasted New Blog: "${blogNotification.title}" to ${io.sockets.sockets.size} active clients`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, notification: blogNotification, recipients: io.sockets.sockets.size }));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Webhook 2: Trigger Instructor Doubt Reply Notification
  if (req.method === 'POST' && req.url === '/notify/doubt') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const doubtNotification = {
          id: `notif_doubt_${Date.now()}`,
          type: 'DOUBT_REPLIED',
          title: `Doubt Resolved: ${payload.courseTitle || 'React Masterclass'}`,
          desc: payload.replyPreview || 'Instructor John Doe replied to your doubt on Module 4.',
          studentEmail: payload.studentEmail || 'ethan@example.com',
          instructorName: payload.instructorName || 'John Doe',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        // Push to specific student room or broadcast
        io.emit('notification:doubt_reply', doubtNotification);
        console.log(`💬 \x1b[36m[WebSocket PUSH]\x1b[0m Pushed Doubt Reply to student (${doubtNotification.studentEmail})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, notification: doubtNotification, recipients: io.sockets.sockets.size }));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found on WebSocket Service' }));
});

// Attach Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/socket.io/',
});

io.on('connection', (socket) => {
  console.log(`⚡ \x1b[33m[WebSocket CONNECT]\x1b[0m Student connected: Socket ID ${socket.id} (Total Online: ${io.sockets.sockets.size})`);

  // Send initial welcome sync
  socket.emit('connection:ack', {
    status: 'connected',
    socketId: socket.id,
    serverTime: new Date().toISOString(),
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 \x1b[31m[WebSocket DISCONNECT]\x1b[0m Socket ID ${socket.id} disconnected (${reason}). Online: ${io.sockets.sockets.size}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ [EduPress WebSocket Notification Service Online] Listening on Port ${PORT}`);
  console.log(`📡 Health Check: http://127.0.0.1:${PORT}/health`);
  console.log(`📢 Blog Webhook: http://127.0.0.1:${PORT}/notify/blog`);
  console.log(`💬 Doubt Webhook: http://127.0.0.1:${PORT}/notify/doubt`);
  console.log(`======================================================\n`);
});
