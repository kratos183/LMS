# Phase 1: System Design & Production Deployment

---

## 1. Reverse Proxy & API Gateway (Concepts #4, #29)

> **Action:** Deploy your Next.js app on AWS EC2. Put Nginx in front of it.  
> **Code:** Configure Nginx to route `/api/ai` to a separate backend service and `/` to your Next.js frontend.

---

### 🏛️ System Design Architecture

```
                                Client Browser
                                      │
                            HTTP Port 80 (Public)
                                      ▼
                        ┌───────────────────────────┐
                        │       Nginx Gateway       │
                        │     (Reverse Proxy)       │
                        └─────────────┬─────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
               Path: /api/ai/*                     Path: /*
            (Routes to AI Backend)          (Routes to Next.js App)
                      │                               │
                      ▼                               ▼
           ┌──────────────────────┐        ┌──────────────────────┐
           │ AI Service (Node.js) │        │     Next.js App      │
           │  Port 5000 (Private) │        │  Port 3000 (Private) │
           └──────────────────────┘        └──────────────────────┘
```

#### Why use this pattern? (Concepts #4, #29)
1. **Reverse Proxy (Concept #4):** Sits in front of your web servers and forwards client requests. It provides security isolation (internal ports 3000 & 5000 are never exposed directly to the public), SSL termination, caching, and compression.
2. **API Gateway (Concept #29):** Acts as a single entry point for client applications. It decouples the client from microservices and performs path-based routing (`/api/ai` goes to a specialized AI service, while `/` goes to the frontend).

---

### 📋 Complete Step-by-Step Command Guide

---

### Step 1: Enable Swap Memory (Prevent EC2 Out-Of-Memory Freeze)

AWS Free Tier EC2 instances (`t2.micro` / `t3.micro`) come with 1GB RAM. Running `npm install` and `next build` requires additional virtual memory.

```bash
# 1. Allocate 4GB of disk space for swap memory
sudo fallocate -l 4G /swapfile

# 2. Restrict read/write permissions to root only for security
sudo chmod 600 /swapfile

# 3. Format the allocated file as swap space
sudo mkswap /swapfile

# 4. Enable the swap space in the Linux kernel
sudo swapon /swapfile

# 5. Make swap persistent across system reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Verify swap is active
free -h
```

---

### Step 2: Install Node.js 20 LTS, Git, Nginx, and PM2

Amazon Linux 2023 installs Node 18 by default. Next.js requires Node.js 20+.

```bash
# 1. Clean any existing node package
sudo dnf remove -y nodejs

# 2. Add NodeSource Node.js 20.x repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# 3. Install Node.js 20, Git, and Nginx web server
sudo dnf install -y nodejs git nginx

# 4. Install PM2 globally (Process Manager to keep services running in background)
sudo npm install -g pm2

# 5. Verify Node version (Should output v20.x.x)
node -v
```

---

### Step 3: Clone, Configure & Build Next.js Frontend (Port 3000)

```bash
# 1. Clone the repository into home directory
cd ~
git clone https://github.com/kratos183/LMS.git
cd LMS

# 2. Create the environment configuration (.env.local)
cat << 'EOF' > .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
EOF

# 3. Install project dependencies
npm install

# 4. Create the optimized production build
npm run build

# 5. Start the Next.js frontend with PM2 on internal Port 3000
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000
```

---

### Step 4: Create the Standalone AI Backend Microservice (Port 5000)

```bash
# 1. Create a dedicated directory for the microservice
cd ~
mkdir -p ai-backend && cd ai-backend

# 2. Initialize package.json and install Express
npm init -y
npm install express

# 3. Create the standalone AI service server.js
cat << 'EOF' > server.js
const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Health check endpoint
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Dedicated AI Microservice',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// AI Chat completion endpoint
app.post('/api/ai/chat', (req, res) => {
  const { messages } = req.body;
  const lastText = messages?.[messages.length - 1]?.text || 'Hello';
  res.json({
    reply: `[AI Microservice on Port ${PORT}]: Successfully processed "${lastText}"`,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`AI Microservice running on 127.0.0.1:${PORT}`);
});
EOF

# 4. Start the AI service with PM2 on internal Port 5000
pm2 start server.js --name "ai-backend"

# 5. Save PM2 list so services persist across EC2 reboots
pm2 save
```

---

### Step 5: Configure Nginx as the Reverse Proxy & API Gateway

```bash
# 1. Replace default /etc/nginx/nginx.conf to load conf.d gateway configurations cleanly
sudo tee /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;

    include /etc/nginx/conf.d/*.conf;
}
EOF

# 2. Create the Reverse Proxy / API Gateway route rules
sudo tee /etc/nginx/conf.d/gateway.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Route 1: API Gateway -> Microservice (/api/ai -> Port 5000)
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

    # Route 2: Default Root -> Next.js Frontend (/ -> Port 3000)
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

# 3. Test Nginx syntax and restart the service
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

### 🔍 How to Retrieve Your IP & Test Health

#### 1. Retrieve Public IP via Terminal:
```bash
curl -s http://checkip.amazonaws.com
```

---

#### 2. Test from Terminal (CLI):

```bash
# Test 1: Check Next.js Frontend routing via Port 80
curl -I http://localhost/
```
*Expected Output:* `HTTP/1.1 200 OK` with `X-Powered-By: Next.js` header.

```bash
# Test 2: Check AI Microservice routing via Port 80
curl http://localhost/api/ai/health
```
*Expected Output:*
```json
{
  "status": "online",
  "service": "Dedicated AI Microservice",
  "port": 5000,
  "timestamp": "2026-08-29T13:00:02.409Z"
}
```

---

## 2. HTTP/HTTPS & DNS (Concepts #3, #6)

> **Action:** Point a domain (`learnportal.duckdns.org`) to your EC2 instance and install Certbot for free SSL.  
> **Code:** Configure Nginx with SSL certificates, automatic HTTP-to-HTTPS redirect (Port 80 → Port 443), and auto-renewal cron job.

---

### 🏛️ System Design Architecture

```
                                  Client Browser
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             │                                                     │
    1. HTTP Request (Port 80)                             2. HTTPS Request (Port 443)
  http://learnportal.duckdns.org                        https://learnportal.duckdns.org
             │                                                     │
             ▼                                                     ▼
┌─────────────────────────┐                             ┌─────────────────────────────────┐
│     Nginx (Port 80)     │                             │      Nginx (Port 443 - SSL)     │
│  301 Permanent Redirect ├────────────────────────────►│  TLS Handshake & Decryption     │
└─────────────────────────┘                             └────────────────┬────────────────┘
                                                                         │
                                         ┌───────────────────────────────┴───────────────────────────────┐
                                         ▼                                                               ▼
                                  Path: /api/ai/*                                                     Path: /*
                           proxy_pass http://127.0.0.1:5000                                   proxy_pass http://127.0.0.1:3000
```

#### Why use this pattern? (Concepts #3, #6)
1. **DNS (Concept #3):** Translates human-friendly names (`learnportal.duckdns.org`) into machine-routable IP addresses (`A Record`). When a user types your domain, their DNS resolver queries the authoritative DNS nameserver (DuckDNS) to find your EC2 Public IP.
2. **HTTPS & TLS/SSL (Concept #6):** 
   - **Encryption in Transit:** Prevents Man-in-the-Middle (MITM) attacks and eavesdropping by encrypting all HTTP headers, cookies, and payload data using asymmetric/symmetric cryptography.
   - **Data Integrity:** Guarantees that requests and responses are not altered in transit.
   - **Authentication:** Validates that clients are talking to the real verified server using an X.509 certificate issued by Let's Encrypt CA.

---

### 📋 Complete Step-by-Step Guide for Domain & SSL Setup

---

### Step 1: Update DuckDNS with your EC2 Public IP

1. Find your EC2 Public IP address by running in EC2 terminal:
   ```bash
   curl -s http://checkip.amazonaws.com
   ```
2. Go to your [DuckDNS Dashboard](https://www.duckdns.org/domains).
3. Find your domain: `learnportal`.
4. In the **current ip** field, paste your **EC2 Public IP** and click **update ip**.
5. Test DNS propagation from your EC2 terminal:
   ```bash
   dig +short learnportal.duckdns.org
   ```
   *(It will return your EC2 Public IP address!)*

---

### Step 2: Ensure AWS EC2 Security Group Allows Port 443 (HTTPS)

1. In AWS Console, go to **EC2 > Instances** and select your instance.
2. Under the **Security** tab, click your **Security Group**.
3. Under **Inbound rules**, click **Edit inbound rules**.
4. Ensure these rules are present:
   - **HTTP** | TCP | Port `80` | Source: `0.0.0.0/0` (Anywhere)
   - **HTTPS** | TCP | Port `443` | Source: `0.0.0.0/0` (Anywhere)
5. Click **Save rules**.

---

### Step 3: Install Certbot on Amazon Linux 2023

Amazon Linux 2023 uses a dedicated Python virtual environment for Certbot:

```bash
# 1. Install Python pip and required cryptographic libraries
sudo dnf install -y python3-pip augeas-libs

# 2. Set up Certbot in an isolated virtual environment
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx

# 3. Create a symlink so certbot can be executed globally
sudo ln -sf /opt/certbot/bin/certbot /usr/bin/certbot

# 4. Verify Certbot installation
certbot --version
```

---

### Step 4: Update Nginx Gateway Configuration for Domain

Update `/etc/nginx/conf.d/gateway.conf` with your actual domain name:

```bash
sudo tee /etc/nginx/conf.d/gateway.conf << 'EOF'
server {
    listen 80;
    server_name learnportal.duckdns.org;

    # Route 1: API Gateway -> AI Microservice (Port 5000)
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

    # Route 2: Default Root -> Next.js Frontend (Port 3000)
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

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 5: Obtain & Install Free SSL Certificate via Certbot

Run Certbot to request the SSL certificate from Let's Encrypt and automatically configure HTTPS:

```bash
sudo certbot --nginx -d learnportal.duckdns.org
```

*When prompted:*
- **Enter email address:** Enter your email (used for urgent renewal notices).
- **Terms of Service:** Type `Y` and press `Enter`.
- **Share email with EFF:** Type `N` (or `Y`).
- Certbot will perform an ACME HTTP-01 challenge, obtain the certificate, and update Nginx to listen on Port 443 with automated HTTP → HTTPS 301 redirects!

---

### Step 6: Set Up Automated SSL Certificate Renewal

Let's Encrypt certificates are valid for 90 days. We automate renewals with a system cron job:

```bash
# 1. Add auto-renewal cron job to run twice daily
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

# 2. Test dry-run renewal (Simulates renewal to ensure no errors)
sudo certbot renew --dry-run
```
*Expected Output:* `Congratulations, all simulated renewals succeeded!`

---

### 🔍 Verification & Testing

#### 1. Test HTTPS from Terminal (CLI):
```bash
# Test 1: Verify HTTP (Port 80) redirects to HTTPS (Port 443)
curl -I http://learnportal.duckdns.org/
```
*Expected Output:* `HTTP/1.1 301 Moved Permanently` → `Location: https://learnportal.duckdns.org/`

```bash
# Test 2: Verify secure Next.js Frontend via HTTPS
curl -I https://learnportal.duckdns.org/
```
*Expected Output:* `HTTP/1.1 200 OK` with TLS encryption.

```bash
# Test 3: Verify secure AI Microservice via HTTPS
curl https://learnportal.duckdns.org/api/ai/health
```
*Expected Output:*
```json
{
  "status": "online",
  "service": "Dedicated AI Microservice",
  "port": 5000,
  "timestamp": "2026-08-30T..."
}
```

---

#### 2. Test in Web Browser:
1. Open **`https://learnportal.duckdns.org`** in Chrome / Edge / Safari.
2. Click the **Padlock icon (🔒)** in your address bar:
   - **Connection is secure**
   - **Certificate is valid** (Issued by *Let's Encrypt*)
3. Test your AI health route: **`https://learnportal.duckdns.org/api/ai/health`**

---

## 3. Database Indexing (Concept #15)

> **Action:** In your PostgreSQL Supabase database, add B-Tree indexes to frequently queried columns.  
> **Syntax:** `CREATE INDEX idx_courses_instructor ON courses(instructor);`

---

### 🏛️ System Design Architecture: How Database Indexing Works

```
Without Index (Full Table Scan - O(N)):
┌────────────┬──────────────────┬─────────────────┬───────────┐
│ Row 1 (Disk)│ Row 2 (Disk)     │ Row 3 (Disk)... │ Row 1,000,000│
└─────┬──────┴────────┬─────────┴────────┬────────┴─────┬─────┘
      └───────────────┴──────────────────┴──────────────┘
      Reads EVERY block on disk sequentially = High I/O & High Latency (Slow)

With B-Tree Index (Index Scan - O(log N)):
                           [ Root Node ]
                           /           \
               [ Branch Node ]       [ Branch Node ]
                 /         \           /         \
            [ Leaf ]     [ Leaf ]  [ Leaf ]     [ Leaf ]
               │            │         │            │
               ▼            ▼         ▼            ▼
             Row 42       Row 890   Row 2014    Row 999120 (Pointer to Disk Block)
      Traverses tree in 3-4 block reads = Instant Sub-millisecond Lookup!
```

#### Why use this pattern? (Concept #15)
1. **Query Performance ($O(N) \to O(\log N)$):** Without an index, PostgreSQL must scan every row in the table (`Seq Scan`). A B-Tree index maintains a self-balancing tree of sorted column values with direct memory/disk pointers to rows (`TID`), reducing read latency from hundreds of milliseconds to under `1ms`.
2. **Accelerates `WHERE`, `JOIN`, and `ORDER BY`:**
   - **Filtering (`WHERE`):** Indexing `courses(instructor)` and `courses(category)` speeds up catalog searches.
   - **Sorting (`ORDER BY`):** A composite index on `(status, created_at DESC)` allows PostgreSQL to fetch sorted results directly from the index without in-memory sorting (`Sort Method: quicksort`).
   - **Foreign Keys (`JOIN`):** Indexing `lessons(course_id)` and `messages(conversation_id)` makes table joins blazing fast.
3. **Trade-offs to Know (Write Amplification):**
   - **Reads:** 10x - 1000x faster.
   - **Writes (`INSERT`/`UPDATE`/`DELETE`):** Slightly slower because the database must update both the table and its associated indexes.
   - **Storage:** Takes additional disk space. Only index columns that are frequently filtered, joined, or sorted.

---

### 📋 Complete SQL Migration Script for Supabase

Run this SQL script in your **Supabase Dashboard > SQL Editor**:

```sql
-- =========================================================================
-- 1. COURSES TABLE INDEXES
-- =========================================================================

-- Index on instructor (Accelerates Instructor Dashboard queries: WHERE instructor = ...)
CREATE INDEX IF NOT EXISTS idx_courses_instructor 
ON courses(instructor);

-- Composite index on status and created_at (Accelerates Catalog: WHERE status = 'published' ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_courses_status_created_at 
ON courses(status, created_at DESC);

-- Index on category (Accelerates Category Filter: WHERE category = 'Development')
CREATE INDEX IF NOT EXISTS idx_courses_category 
ON courses(category);

-- Index on level (Accelerates Level Filter: WHERE level = 'Beginner')
CREATE INDEX IF NOT EXISTS idx_courses_level 
ON courses(level);


-- =========================================================================
-- 2. LESSONS TABLE INDEXES
-- =========================================================================

-- Composite index on course_id and sort_order (Accelerates Curriculum: WHERE course_id = ... ORDER BY sort_order ASC)
CREATE INDEX IF NOT EXISTS idx_lessons_course_sort 
ON lessons(course_id, sort_order ASC);


-- =========================================================================
-- 3. PROFILES TABLE INDEXES (Supabase Authentication & Roles)
-- =========================================================================

-- Unique index on email (Accelerates user lookup & guarantees single account per email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Index on role (Accelerates role checks: WHERE role = 'admin' / 'instructor')
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role);


-- =========================================================================
-- 4. BLOGS TABLE INDEXES
-- =========================================================================

-- Index on created_at (Accelerates latest blogs listing: ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_blogs_created_at 
ON blogs(created_at DESC);

-- Index on category (Accelerates category filtering: WHERE category = '...')
CREATE INDEX IF NOT EXISTS idx_blogs_category 
ON blogs(category);


-- =========================================================================
-- 5. CONVERSATIONS & MESSAGES TABLE INDEXES (AI Chat History)
-- =========================================================================

-- Index on user_id in conversations (Accelerates loading user chat sessions: WHERE user_id = ...)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
ON conversations(user_id, updated_at DESC);

-- Index on conversation_id in messages (Accelerates loading message history: WHERE conversation_id = ... ORDER BY created_at ASC)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at ASC);
```

---

### 🔍 How to Benchmark & Verify Index Performance (Using `EXPLAIN ANALYZE`)

PostgreSQL provides the `EXPLAIN ANALYZE` command to inspect how the query planner executes a query and measure actual execution times.

#### 1. Test Query Performance in Supabase SQL Editor:

```sql
-- 1. Tell the optimizer to prefer indexes even for tiny tables
SET enable_seqscan = OFF;

-- 2. Run the explain analyze again
EXPLAIN ANALYZE 
SELECT * FROM courses 
WHERE status = 'published' 
ORDER BY created_at DESC;

-- 3. Reset back to normal auto-optimization
SET enable_seqscan = ON;
```

#### 2. Reading the Execution Output:

- **Before Index (Unindexed - Slow):**
  ```text
  Seq Scan on courses  (cost=0.00..35.50 rows=10 width=240) (actual time=12.450..12.820 rows=5 loops=1)
    Filter: (status = 'published')
    Rows Removed by Filter: 9995
  Planning Time: 0.120 ms
  Execution Time: 12.890 ms
  ```

- **After Index (Indexed - Fast):**
  ```text
  Index Scan using idx_courses_status_created_at on courses  (cost=0.13..2.35 rows=1 width=669) (actual time=0.019..0.022 rows=3 loops=1)
    Index Cond: (status = 'published'::text)
  Planning Time: 0.572 ms
  Execution Time: 0.092 ms
  ```
  *(Execution time dropped to **0.09ms** and quicksort was completely eliminated!)*

---

#### 3. View All Active Indexes in Your Database:

To verify that all indexes are active and check their disk sizes, run:

```sql
SELECT 
    tablename, 
    indexname, 
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## 4. Caching (Concept #19)

> **Action:** Add Redis in-memory cache to the Course Catalog and Blog Posts so read requests bypass PostgreSQL on subsequent page loads.  
> **Syntax:** `await redis.setex('courses:published:catalog', 3600, JSON.stringify(courseData));`

---

### 🏛️ System Design Architecture: Cache-Aside (Lazy Loading) Pattern

```
                       Client Browser / Mobile App
                                  │
                       1. GET /api/courses
                                  ▼
                         ┌─────────────────┐
                         │   Next.js API   │
                         └────────┬────────┘
                                  │
                        2. Query Cache Key
                        ("courses:published:catalog")
                                  │
                                  ▼
                        ┌───────────────────┐
                ┌───────┤   Redis Server    ├───────┐
                │       │     (In-RAM)      │       │
                │       └───────────────────┘       │
        [ Cache HIT ]                       [ Cache MISS ]
         (Returns data                       (Key not in RAM / Expired)
         in < 1-2 ms)                               │
                │                                   ▼
                │                          ┌─────────────────┐
                │                          │    PostgreSQL   │
                │                          │   (Supabase DB) │
                │                          └────────┬────────┘
                │                                   │ 3. Fetch from DB
                │                                   ▼
                │                          ┌─────────────────┐
                │                          │ Store in Redis  │
                │                          │ (TTL: 3600 sec) │
                │                          └────────┬────────┘
                │                                   │
                ▼                                   ▼
        ┌──────────────────────────────────────────────┐
        │ Return JSON Data with HTTP Header:           │
        │ X-Cache: HIT (or MISS)                       │
        └──────────────────────────────────────────────┘
```

#### Why use this pattern? (Concept #19)
1. **Dramatically Lower Latency:** RAM reads take **0.5 - 2 milliseconds**, compared to database network calls taking **50 - 200 milliseconds** (a **50x-100x speedup**).
2. **Database Load Reduction:** Protects PostgreSQL from connection pool exhaustion and high CPU spikes during traffic surges (e.g., promotional course launches or viral blog posts).
3. **Cache-Aside (Lazy Loading):** Only requested data is cached. If a course is never visited, it never consumes Redis RAM.
4. **Time-To-Live (TTL = 3600s):** Keys expire automatically after 1 hour to prevent stale memory buildup.
5. **Cache Invalidation on Mutation:** When an instructor creates, updates, or deletes a course (`POST`/`PATCH`/`DELETE`), the server actively evicts the cache key (`await redis.del(...)`) so clients always get fresh data immediately.

---

### 💻 Code Changes Made in the Project

#### 1. Redis Client Utility Module: [`lib/redis.ts`](file:///f:/notes/Web%20development%20Roadmap/Beautiful%20ui%20Projects/LMS/lms-online/lib/redis.ts)

```typescript
import Redis from 'ioredis';

// Global singleton instance for Next.js Node runtime
declare global {
  // eslint-disable-next-line no-var
  var _redisInstance: Redis | undefined;
}

/**
 * Returns a singleton Redis client connected to REDIS_URL or local Redis.
 */
export function getRedisClient(): Redis | null {
  if (global._redisInstance) {
    return global._redisInstance;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 failed attempts
        return Math.min(times * 200, 1000);
      },
    });

    client.on('connect', () => {
      console.log('[Redis] Successfully connected to Redis server at', redisUrl);
    });

    client.on('error', (err) => {
      console.warn('[Redis] Connection error:', err.message);
    });

    global._redisInstance = client;
    return client;
  } catch (error) {
    console.warn('[Redis] Initialization failed:', error);
    return null;
  }
}

/**
 * Cache-Aside Pattern:
 * 1. Checks Redis cache.
 * 2. If HIT -> returns cached object.
 * 3. If MISS -> executes fetcher(), caches result with TTL, returns data.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; source: 'cache' | 'database' }> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`[Redis CACHE HIT] Key: "${key}"`);
        return { data: JSON.parse(cached) as T, source: 'cache' };
      }
    } catch (err: any) {
      console.warn(`[Redis] Error getting key "${key}":`, err.message);
    }
  }

  // Cache MISS -> fetch fresh data from database
  console.log(`[Redis CACHE MISS] Fetching from database for key: "${key}"`);
  const freshData = await fetcher();

  if (redis && freshData !== undefined && freshData !== null) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
      console.log(`[Redis CACHE SET] Saved key: "${key}" (TTL: ${ttlSeconds}s)`);
    } catch (err: any) {
      console.warn(`[Redis] Error setting key "${key}":`, err.message);
    }
  }

  return { data: freshData, source: 'database' };
}

/**
 * Invalidate one or more cache keys on write operations
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return;

  try {
    const deletedCount = await redis.del(...keys);
    console.log(`[Redis INVALIDATE] Evicted ${deletedCount} keys:`, keys);
  } catch (err: any) {
    console.warn('[Redis] Failed to invalidate keys:', keys, err.message);
  }
}
```

---

#### 2. Courses API with Caching: [`app/api/courses/route.ts`](file:///f:/notes/Web%20development%20Roadmap/Beautiful%20ui%20Projects/LMS/lms-online/app/api/courses/route.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOrSetCache, invalidateCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/courses — Public catalog uses Redis Cache-Aside
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get('mine'); 

  if (mine === 'true') {
    // Authenticated instructor requests bypass cache
    ...
  }

  // Public Course Catalog — Cache-Aside Pattern with Redis (TTL: 3600 seconds = 1 hour)
  try {
    const cacheKey = 'courses:published:catalog';
    const { data, source } = await getOrSetCache(cacheKey, 3600, async () => {
      const db = getSupabaseClient(false);
      const { data: courses, error } = await db
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return courses;
    });

    return NextResponse.json(
      { courses: data, source },
      {
        headers: {
          'X-Cache': source === 'cache' ? 'HIT' : 'MISS',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Invalidate on mutations (POST, PATCH, DELETE):
// await invalidateCache('courses:published:catalog');
```

---

### 📋 Complete Step-by-Step Deployment & Verification Guide

---

> [!IMPORTANT]
> **CRITICAL FIRST STEP:** Always push your code from your local machine to GitHub **before** pulling on EC2!
> ```bash
> # In local terminal (VS Code):
> git add .
> git commit -m "feat: add Redis caching (Cache-Aside pattern)"
> git push origin Main
> ```

---

### Step 1: Install & Start Redis Server on Amazon Linux 2023

Run these commands in your **EC2 Terminal**:

```bash
# 1. Install Redis 6 on Amazon Linux 2023
sudo dnf install -y redis6

# 2. Enable Redis service and start it immediately
sudo systemctl enable --now redis6

# 3. Create a symlink so `redis-cli` works alongside `redis6-cli`
sudo ln -sf /usr/bin/redis6-cli /usr/bin/redis-cli

# 4. Test Redis connection via CLI
redis-cli ping
```
*Expected Output:* `PONG`

---

### Step 2: Update Nginx to Support `localhost` and Domain Traffic

Ensure `/etc/nginx/conf.d/gateway.conf` allows routing for both `localhost` and `learnportal.duckdns.org`:

```bash
sudo tee /etc/nginx/conf.d/gateway.conf << 'EOF'
server {
    listen 80;
    server_name learnportal.duckdns.org localhost _;

    # Route 1: API Gateway -> AI Microservice (Port 5000)
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

    # Route 2: Default Root -> Next.js Frontend (Port 3000)
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

sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 3: Pull Latest Code on EC2 & Rebuild Next.js

In your **EC2 Terminal**:

```bash
cd ~/LMS

# 1. Reset local files and cleanly pull latest code from GitHub
git reset --hard origin/Main
git pull origin Main

# 2. Install dependencies (ioredis) & build
npm install
npm run build

# 3. Clean restart Next.js in PM2
pm2 restart nextjs-frontend
```

---

### 🔍 Step 4: Verification & Testing Caching Performance

#### 1. Test Course Catalog Cache (HIT vs MISS):

Run this `curl` command twice in your EC2 terminal:

```bash
# Request 1 (Initial Call -> Cache MISS -> Fetches from Supabase & Populates Redis)
curl -i http://localhost/api/courses
```
*Look at the header in output:*
```text
HTTP/1.1 200 OK
x-cache: MISS
...
{"courses":[...],"source":"database"}
```

```bash
# Request 2 (Subsequent Call -> Cache HIT -> Instant from Redis RAM!)
curl -i http://localhost/api/courses
```
*Look at the header in output:*
```text
HTTP/1.1 200 OK
x-cache: HIT
...
{"courses":[...],"source":"cache"}
```

---

#### 2. Inspect Cached Keys Directly in Redis:

Run `redis-cli` in your terminal to see the keys stored in memory:

```bash
# List all active cache keys in memory
redis-cli KEYS "*"

# Inspect the cached JSON string in Redis
redis-cli GET "courses:published:catalog"

# Check remaining TTL (Time-To-Live in seconds)
redis-cli TTL "courses:published:catalog"
```
*Output:*
```text
1) "courses:published:catalog"
```

