# AWS CLI & EC2 Verification Commands — SkillStream LMS

All commands are grouped by phase. Run them in order inside your **EC2 SSH terminal** unless noted otherwise.

---

## Phase 1 — Server Setup, Nginx, SSL, Redis, Scaling

---

### 1. Swap Memory (Prevent OOM on t2.micro)

```bash
# Allocate 4GB swap file on disk
sudo fallocate -l 4G /swapfile

# Lock permissions to root only
sudo chmod 600 /swapfile

# Format as swap
sudo mkswap /swapfile

# Activate swap
sudo swapon /swapfile

# Persist across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify — should show 4G under Swap row
free -h
```

---

### 2. Install Node.js 20, Git, Nginx, PM2

```bash
# Remove old Node if present
sudo dnf remove -y nodejs

# Add NodeSource Node.js 20 repo
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Install Node 20, Git, Nginx
sudo dnf install -y nodejs git nginx

# Install PM2 globally
sudo npm install -g pm2

# Confirm Node version — must show v20.x.x
node -v
```

---

### 3. Clone Repo & Build Next.js (Port 3000)

```bash
cd ~
git clone https://github.com/kratos183/LMS.git
cd LMS

# Create env file with your real credentials
cat << 'EOF' > .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
EOF

npm install
npm run build

# Start Next.js on port 3000 under PM2
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000
```

---

### 4. Start AI Microservice (Port 5000)

```bash
cd ~
mkdir -p ai-backend && cd ai-backend
npm init -y
npm install express

# Create the Express server
cat << 'EOF' > server.js
const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/ai/health', (req, res) => {
  res.json({ status: 'online', service: 'AI Microservice', port: 5000, timestamp: new Date().toISOString() });
});
app.post('/api/ai/chat', (req, res) => {
  const { messages } = req.body;
  const lastText = messages?.[messages.length - 1]?.text || 'Hello';
  res.json({ reply: `[AI Port 5000]: Processed "${lastText}"`, timestamp: new Date().toISOString() });
});
app.listen(5000, '127.0.0.1', () => console.log('AI Microservice on 127.0.0.1:5000'));
EOF

pm2 start server.js --name "ai-backend"
pm2 save
```

---

### 5. Configure Nginx Reverse Proxy

```bash
# Write main nginx.conf
sudo tee /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Write gateway routing rules
sudo tee /etc/nginx/conf.d/gateway.conf << 'EOF'
server {
    listen 80;
    server_name learnportal.duckdns.org localhost _;

    location /api/ai {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Validate config syntax
sudo nginx -t

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

### 6. Verify Nginx Routing

```bash
# Get your EC2 public IP
curl -s http://checkip.amazonaws.com

# Test Next.js frontend via port 80 — expect HTTP 200 with x-powered-by: Next.js
curl -I http://localhost/

# Test AI microservice routing — expect JSON with status: online
curl http://localhost/api/ai/health
```

---

### 7. DNS Check (DuckDNS)

```bash
# After updating DuckDNS with your EC2 IP, verify DNS resolves correctly
dig +short learnportal.duckdns.org
# Should return your EC2 public IP
```

---

### 8. Install Certbot & Get Free SSL

```bash
# Install Python and Certbot
sudo dnf install -y python3-pip augeas-libs
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -sf /opt/certbot/bin/certbot /usr/bin/certbot

# Confirm Certbot installed
certbot --version

# Obtain SSL certificate (Nginx auto-configured)
sudo certbot --nginx -d learnportal.duckdns.org

# Set up auto-renewal cron job (runs twice daily)
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

# Test renewal dry-run — expect: all simulated renewals succeeded
sudo certbot renew --dry-run
```

---

### 9. Verify HTTPS

```bash
# HTTP should redirect to HTTPS — expect 301 Moved Permanently
curl -I http://learnportal.duckdns.org/

# HTTPS frontend — expect 200 OK
curl -I https://learnportal.duckdns.org/

# HTTPS AI health — expect JSON with status: online
curl https://learnportal.duckdns.org/api/ai/health
```

---

### 10. Install & Verify Redis

```bash
# Install Redis 6
sudo dnf install -y redis6

# Enable and start Redis
sudo systemctl enable --now redis6

# Create redis-cli symlink
sudo ln -sf /usr/bin/redis6-cli /usr/bin/redis-cli

# Ping Redis — expect: PONG
redis-cli ping
```

---

### 11. Pull Latest Code & Rebuild

```bash
cd ~/LMS

# Hard reset and pull latest from GitHub
git reset --hard origin/Main
git pull origin Main

npm install
npm run build

# Restart Next.js
pm2 restart nextjs-frontend
```

---

### 12. Verify Redis Caching (Cache HIT vs MISS)

```bash
# First request — Cache MISS, fetches from Supabase
# Look for: x-cache: MISS and "source":"database"
curl -i http://localhost/api/courses

# Second request — Cache HIT, served from Redis RAM
# Look for: x-cache: HIT and "source":"cache"
curl -i http://localhost/api/courses

# Inspect cached keys in Redis
redis-cli KEYS "*"

# View the cached JSON value
redis-cli GET "courses:published:catalog"

# Check remaining TTL in seconds
redis-cli TTL "courses:published:catalog"
```

---

### 13. Verify AI Latency Benchmarking

```bash
# First call — Cache MISS, calls Groq LLM (~1200ms)
# Look for: x-cache: MISS, x-response-time: ~1200ms, "source":"llm"
curl -i -X POST http://127.0.0.1:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"How much money have I spent on courses?"}],"studentContext":{"email":"ethan@example.com","totalSpent":"₹3,297"}}'

# Second call — Cache HIT, served from Redis (~4ms)
# Look for: x-cache: HIT, x-response-time: ~4ms, "source":"cache"
curl -i -X POST http://127.0.0.1:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"How much money have I spent on courses?"}],"studentContext":{"email":"ethan@example.com","totalSpent":"₹3,297"}}'
```

---

### 14. Vertical Scaling via AWS CLI (t2.micro → t2.small)

Run these from your **local machine** with AWS CLI configured:

```bash
# Set your instance ID
INSTANCE_ID="i-0f776d77aa2ad224b"

# Save PM2 processes before stopping (run this on EC2 first)
# pm2 save && pm2 startup

# Stop the instance
aws ec2 stop-instances --instance-ids $INSTANCE_ID

# Wait until fully stopped
aws ec2 wait instance-stopped --instance-ids $INSTANCE_ID

# Upgrade instance type to t2.small (2GB RAM)
aws ec2 modify-instance-attribute \
    --instance-id $INSTANCE_ID \
    --instance-type "{\"Value\": \"t2.small\"}"

# Start the upgraded instance
aws ec2 start-instances --instance-ids $INSTANCE_ID
```

---

### 15. Verify Post-Upgrade Resources

```bash
# Confirm RAM increased to ~2GB
free -h

# Check CPU info
lscpu | grep -E "Model name|CPU\(s\):|Thread"

# Check all services are healthy
pm2 status
sudo systemctl status nginx
sudo systemctl status redis6

# Test live domain still works
curl -I https://learnportal.duckdns.org/
```

---

## Phase 2 — Async, Microservices, WebSockets, Webhooks, Rate Limiting

---

### 16. Start All 4 PM2 Services

```bash
cd ~/LMS
git reset --hard origin/Main
git pull origin Main
npm install
npm run build

# Delete old processes and start fresh
pm2 delete all

# Service 1: Next.js (Port 3000)
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000

# Service 2: Certificate background worker
pm2 start npm --name "certificate-worker" -- run worker

# Service 3: AI Microservice (Port 5000)
pm2 start npm --name "ai-microservice" -- run ai-service

# Service 4: WebSocket Notification Service (Port 4000)
pm2 start npm --name "websocket-service" -- run ws-service

# Save PM2 state for auto-restart on reboot
pm2 save

# Verify all 4 are online
pm2 status
```

---

### 17. Test Message Queue (Course Completion Event)

```bash
# Simulate a student completing a course
# Expect: HTTP 200, latencyMs < 20ms, status: QUEUED
curl -i -X POST http://127.0.0.1:3000/api/courses/complete \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "c101",
    "courseTitle": "Full Stack Web Development",
    "studentEmail": "ethan@example.com",
    "studentName": "Ethan Hunt",
    "instructorName": "John Doe"
  }'

# Watch the background worker process the job in real-time
pm2 logs certificate-worker --lines 25
```

---

### 18. Inspect Redis Stream Queue

```bash
# View last 5 messages in the course completion stream
redis-cli XREVRANGE stream:course_completed + - COUNT 5

# View consumer group stats and pending job counts
redis-cli XINFO GROUPS stream:course_completed
```

---

### 19. Test AI Microservice Directly (Port 5000)

```bash
# Health check on the standalone AI microservice
# Expect: status: healthy, redisConnected: true
curl -i http://127.0.0.1:5000/health
```

---

### 20. Test Inter-Service Communication (Next.js → AI Microservice)

```bash
# First call — Cache MISS, AI microservice calls Groq LLM
# Look for: X-Cache: MISS, X-Gateway-Time header
curl -i -X POST http://127.0.0.1:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "text": "How much money have I spent on courses?"}],
    "studentContext": {"name": "Ethan Hunt", "email": "ethan@example.com", "totalSpent": "₹3,297"}
  }'

# Second call — Cache HIT from Redis (~4ms)
# Look for: X-Cache: HIT, latencyMs: ~4
curl -i -X POST http://127.0.0.1:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "text": "How much money have I spent on courses?"}],
    "studentContext": {"name": "Ethan Hunt", "email": "ethan@example.com", "totalSpent": "₹3,297"}
  }'
```

---

### 21. Test WebSocket Notification Push

```bash
# Trigger a real-time blog notification to all connected students
# Open the Student Dashboard in browser first, then run this
curl -i -X POST http://127.0.0.1:4000/notify/blog \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mastering Next.js Turbopack in 2026",
    "author": "John Doe",
    "desc": "Learn how to optimize bundle sizes and speed up HMR build times by 10x."
  }'

# Trigger a doubt reply notification
curl -i -X POST http://127.0.0.1:4000/notify/doubt \
  -H "Content-Type: application/json" \
  -d '{
    "courseTitle": "React Masterclass",
    "replyPreview": "Yes! useEffect cleanups execute before the component unmounts.",
    "studentEmail": "ethan@example.com",
    "instructorName": "John Doe"
  }'
```

---

### 22. Test Webhook HMAC Verification (3 Scenarios)

```bash
# Scenario 1: Valid signed payment — expect HTTP 200, status: CAPTURED
npx tsx scripts/simulate-razorpay-webhook.ts https://learnportal.duckdns.org/api/webhooks/razorpay VALID

# Scenario 2: Duplicate/replay attack — expect HTTP 200, Already processed (Idempotent)
npx tsx scripts/simulate-razorpay-webhook.ts https://learnportal.duckdns.org/api/webhooks/razorpay DUPLICATE

# Scenario 3: Forged/tampered signature — expect HTTP 400 Bad Request
npx tsx scripts/simulate-razorpay-webhook.ts https://learnportal.duckdns.org/api/webhooks/razorpay TAMPERED
```

---

### 23. Test Rate Limiting (Sliding Window — 10 req/min)

```bash
# Fires 12 rapid requests — first 10 pass, last 2 get HTTP 429
# Expect: requests 1-10 show HTTP 200, requests 11-12 show HTTP 429 with Retry-After header
npx tsx scripts/test-rate-limit.ts https://learnportal.duckdns.org/api/ai/chat
```

---

### 24. View Live PM2 Logs

```bash
# Stream all service logs
pm2 logs --lines 20

# Stream only Next.js logs (latency benchmarks appear here)
pm2 logs nextjs-frontend --lines 20

# Stream only certificate worker logs
pm2 logs certificate-worker --lines 25

# Stream only AI microservice logs
pm2 logs ai-microservice --lines 20
```

---

## Phase 3 — Database, Sharding, Horizontal Scaling, CDN

---

### 25. Configure MongoDB URI on EC2

```bash
# Append MongoDB Atlas connection string to .env.local
cat << 'EOF' >> ~/LMS/.env.local

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/edupress_lms?retryWrites=true&w=majority
EOF
```

---

### 26. Rebuild After Adding MongoDB

```bash
cd ~/LMS
git pull origin Main
npm run build
pm2 restart all
```

---

### 27. Test MongoDB Activity Logging (Polyglot Persistence)

```bash
# Write a test activity log to MongoDB
curl -X POST https://learnportal.duckdns.org/api/logs/activity \
  -H "Content-Type: application/json" \
  -d '{
    "action": "EC2_CLI_VERIFICATION_TEST",
    "studentEmail": "ethan@example.com",
    "details": { "testSource": "AWS EC2 Terminal", "concept": "Concept #11 Polyglot Persistence" }
  }'

# Query the last 5 activity logs from MongoDB
curl -s https://learnportal.duckdns.org/api/logs/activity?limit=5 | jq .
```

---

### 28. Test Persistent AI Chat History (MongoDB)

```bash
# Ask the AI a question (it gets persisted to MongoDB)
curl -X POST https://learnportal.duckdns.org/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "text": "What is Polyglot Persistence in distributed systems?"}],
    "studentContext": {"email": "ethan@example.com", "name": "Ethan Hunt"}
  }'

# Fetch the persisted chat history from MongoDB
curl -s "https://learnportal.duckdns.org/api/ai/history?email=ethan@example.com" | jq .
```

---

### 29. Test Denormalized Reviews (0 SQL JOINs)

```bash
# Write a denormalized review (instructor_name and course_title embedded at write time)
curl -X POST https://learnportal.duckdns.org/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course-react-19",
    "course_title": "Advanced React 19 Patterns & Server Actions",
    "instructor_name": "John Doe",
    "student_name": "Ethan Hunt",
    "student_email": "ethan@example.com",
    "rating": 5,
    "text": "Concept #20 Denormalization reduces query latency to sub-millisecond levels!"
  }'

# Read all reviews — no JOINs, observe latencyMs in response
curl -s "https://learnportal.duckdns.org/api/reviews" | jq .

# Filter reviews by instructor name
curl -s "https://learnportal.duckdns.org/api/reviews?instructorName=John%20Doe" | jq .
```

---

### 30. Test Vertical Partitioning (Auth vs Profile Tables)

```bash
# Full benchmark comparison — shows page density, memory savings, latency
curl -s "https://learnportal.duckdns.org/api/users/vertical-partition?mode=comparison" | jq .

# Query only the auth partition (~112 bytes/row, hot path)
curl -s "https://learnportal.duckdns.org/api/users/vertical-partition?mode=auth&email=student@example.com" | jq .

# Query only the profile partition (~648 bytes/row, cold path)
curl -s "https://learnportal.duckdns.org/api/users/vertical-partition?mode=profile&email=student@example.com" | jq .

# Write a new partitioned user record
curl -X POST https://learnportal.duckdns.org/api/users/vertical-partition \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student.part@example.com",
    "role": "STUDENT",
    "status": "ACTIVE",
    "username": "student_part",
    "fullName": "Partitioned Student",
    "bio": "Concept #18 Vertical Partitioning separates auth from profiles.",
    "preferences": {"theme": "dark", "emailNotifications": true, "language": "en"}
  }' | jq .
```

---

### 31. Test Hash-Based Sharding (4 MongoDB Shards)

```bash
# Write logs for 4 different students — each routes to a different shard
curl -X POST https://learnportal.duckdns.org/api/logs/sharded \
  -H "Content-Type: application/json" \
  -d '{"action":"VIEW_TAB","studentEmail":"ethan@example.com","details":{"tab":"dashboard"}}'

curl -X POST https://learnportal.duckdns.org/api/logs/sharded \
  -H "Content-Type: application/json" \
  -d '{"action":"AI_QUERY","studentEmail":"alice@example.com","details":{"prompt":"What is sharding?"}}'

curl -X POST https://learnportal.duckdns.org/api/logs/sharded \
  -H "Content-Type: application/json" \
  -d '{"action":"VIDEO_SEEK","studentEmail":"charlie@example.com","details":{"seekTo":"4:32"}}'

curl -X POST https://learnportal.duckdns.org/api/logs/sharded \
  -H "Content-Type: application/json" \
  -d '{"action":"COURSE_COMPLETE","studentEmail":"diana@example.com","details":{"courseId":"react-19"}}'

# Read from the correct shard for ethan — does NOT scan all 4 shards
curl -s "https://learnportal.duckdns.org/api/logs/sharded?email=ethan@example.com" | jq .

# Cross-shard stats — verify even 1-1-1-1 distribution
curl -s "https://learnportal.duckdns.org/api/logs/sharded?stats=true" | jq .
```

---

### 32. Horizontal Scaling — Update Nginx for 3-Instance Cluster

```bash
# Configure Nginx upstream round-robin load balancer
sudo tee /etc/nginx/conf.d/gateway.conf << 'EOF'
upstream nextjs_cluster {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name learnportal.duckdns.org localhost _;

    location / {
        proxy_pass http://nextjs_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo nginx -t && sudo systemctl reload nginx

# Re-apply SSL after Nginx config change
sudo certbot --nginx -d learnportal.duckdns.org --reinstall
```

---

### 33. Deploy 3-Instance Docker Cluster

```bash
cd ~/LMS

# Clean old Docker images and containers
docker system prune -af

git pull origin Main

# Build and start all 6 containers (3 Next.js + Redis + AI + WebSocket)
docker compose up -d --build

# Verify all 6 containers are running
docker compose ps
```

---

### 34. Verify All 3 Next.js Instances Respond

```bash
# Each should return HTTP 200 with x-powered-by: Next.js
curl -I http://127.0.0.1:3001
curl -I http://127.0.0.1:3002
curl -I http://127.0.0.1:3003
```

---

### 35. Verify Nginx Round-Robin Distribution

```bash
# Send 6 requests — all should return 200
for i in {1..6}; do curl -s -o /dev/null -w "Request $i: %{http_code}\n" https://learnportal.duckdns.org/; done

# Check each instance received ~2 requests (round-robin: 1→2→3→1→2→3)
docker compose logs nextjs-1 --tail=5
docker compose logs nextjs-2 --tail=5
docker compose logs nextjs-3 --tail=5
```

---

### 36. Verify Fault Tolerance

```bash
# Kill one instance — platform should stay up
docker compose stop nextjs-2

# Site still returns 200 with 2 of 3 instances
curl -I https://learnportal.duckdns.org/

# Bring it back
docker compose start nextjs-2
```

---

### 37. Verify Cloudinary Presigned Upload

```bash
# Append Cloudinary credentials to .env.local
cat << 'EOF' >> ~/LMS/.env.local

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
EOF

# Request a presigned upload URL — EC2 never touches the file
curl -X POST https://learnportal.duckdns.org/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "avatar.png", "contentType": "image/png"}' | jq .

# Get a secure download URL for an existing asset
curl -s "https://learnportal.duckdns.org/api/upload/download?publicId=lms/uploads/avatar_1694444400" | jq .
```

---

### 38. Database Indexes (Run in Supabase SQL Editor)

These are SQL commands — run them in **Supabase Dashboard → SQL Editor**, not in the terminal:

```sql
-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor);
CREATE INDEX IF NOT EXISTS idx_courses_status_created_at ON courses(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Lessons index
CREATE INDEX IF NOT EXISTS idx_lessons_course_sort ON lessons(course_id, sort_order ASC);

-- Profiles indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Blogs indexes
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);

-- AI chat indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at ASC);

-- Verify all indexes were created
SELECT tablename, indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Benchmark a query to confirm index is being used
SET enable_seqscan = OFF;
EXPLAIN ANALYZE SELECT * FROM courses WHERE status = 'published' ORDER BY created_at DESC;
SET enable_seqscan = ON;
```

---

## Quick Health Check — Run Anytime

```bash
# All PM2 services status
pm2 status

# Nginx status
sudo systemctl status nginx

# Redis status and ping
sudo systemctl status redis6
redis-cli ping

# Docker containers (if using Docker)
docker compose ps

# All Redis keys in memory
redis-cli KEYS "*"

# Live domain health
curl -I https://learnportal.duckdns.org/
```
