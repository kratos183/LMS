# 🔄 EC2 Instance Restart & Auto-Recovery Operations Guide

---

## 🚨 Got "502 Bad Gateway"? Instant 10-Second Fix

A **502 Bad Gateway** simply means **Nginx is running on Port 80/443, but Next.js (Port 3000) is stopped in PM2**.

👉 **Copy and paste this exact block into your EC2 Terminal to fix it instantly:**

```bash
cd ~/LMS

# 1. Pull latest code & install dependencies
git reset --hard origin/Main
git pull origin Main
npm install
npm run build

# 2. Start Redis & Nginx
sudo systemctl start redis6
sudo systemctl restart nginx

# 3. Clean start all 4 PM2 microservices
pm2 delete all
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000
pm2 start npm --name "certificate-worker" -- run worker
pm2 start npm --name "ai-microservice" -- run ai-service
pm2 start npm --name "websocket-service" -- run ws-service

# 4. Save list so it automatically starts on any future reboot!
pm2 save
pm2 status

```
*(Your website `https://learnportal.duckdns.org` will instantly turn **HTTP 200 OK**!)*

---

## 📑 Table of Contents
1. [502 Bad Gateway Instant Fix](#-got-502-bad-gateway-instant-fix)
2. [How to Restart the EC2 Instance](#1-how-to-restart-the-ec2-instance)
3. [Starting Web Application Services After a Reboot](#2-starting-web-application-services-after-a-reboot)
4. [One-Click Clean Restart Command](#3-one-click-clean-restart-command-all-4-microservices)
5. [Automated Permanent DuckDNS IP Assignment](#4-automated-permanent-duckdns-ip-assignment)
6. [Health Check & Verification Checklist](#5-health-check--verification-checklist)
7. [How to Connect via Windows SSH Terminal (No .pem Required)](#6-how-to-connect-via-windows-ssh-terminal-no-pem-required)

---

## 1. How to Restart the EC2 Instance

There are three ways to restart your AWS EC2 instance:

### Method A: Via AWS Web Console (Recommended for Maintenance / Scaling)
1. Open the **[AWS EC2 Console](https://console.aws.amazon.com/ec2/)**.
2. Click **Instances** in the left sidebar.
3. Select your instance (`lms-gateway-server` / `ip-172-31-46-19`).
4. Click **Instance state** ▾ in the top right:
   - Choose **Reboot instance** (Soft reboot without releasing IP).
   - Or choose **Stop instance** ➔ wait 30 seconds until *Stopped* ➔ click **Start instance** (Hard restart / resizing).

---

### Method B: Via Terminal / SSH (Fast Soft Reboot)
Inside your EC2 SSH terminal, run:
```bash
sudo reboot
```
*(The terminal will disconnect. Wait 30–45 seconds, then reconnect via SSH).*

---

### Method C: Via AWS CLI (Accurate CLI Playbook)

If you have the **AWS CLI** installed on your local computer or terminal, you can manage and restart your instance using the following commands:

#### 1. (One-time) Configure AWS CLI Credentials:
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and Region (e.g., ap-south-1 or eu-north-1)
```

#### 2. Find Your Instance ID & Current Status:
```bash
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running,stopped" \
  --query "Reservations[*].Instances[*].[InstanceId,Tags[?Key=='Name'].Value|[0],State.Name,PublicIpAddress]" \
  --output table
```

#### 3. Perform a Fast Soft Reboot (No IP Change):
```bash
aws ec2 reboot-instances --instance-ids i-0123456789abcdef0
```
*(Reboots the operating system without shutting down the hypervisor host or releasing the dynamic IP).*

#### 4. Perform a Clean Stop, Wait, and Start (Hard Reboot / Scaling):
```bash
# A. Send Stop command
aws ec2 stop-instances --instance-ids i-0123456789abcdef0

# B. Wait until instance has completely stopped
aws ec2 wait instance-stopped --instance-ids i-0123456789abcdef0
echo "Instance stopped successfully."

# C. Send Start command
aws ec2 start-instances --instance-ids i-0123456789abcdef0

# D. Wait until instance is fully online
aws ec2 wait instance-running --instance-ids i-0123456789abcdef0
echo "Instance is running and ready for connections!"
```

#### 5. Verify Instance Health Checks via CLI:
```bash
aws ec2 describe-instance-status \
  --instance-ids i-0123456789abcdef0 \
  --query "InstanceStatuses[*].[InstanceId,InstanceState.Name,SystemStatus.Status,InstanceStatus.Status]" \
  --output table
```

---

## 2. Starting Web Application Services After a Reboot

When the EC2 instance turns back on, ensure the following core services are active:

### 1. Redis 6 (In-Memory Cache & Message Streams)
```bash
sudo systemctl start redis6
sudo systemctl enable redis6
```

### 2. Nginx Web Server (Reverse Proxy & SSL Port 443)
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Restore All PM2 Microservices
```bash
cd ~/LMS

# Restore all saved PM2 background processes
pm2 resurrect
```

---

## 3. One-Click Clean Restart Command (All 4 Microservices)

If you ever want to cleanly rebuild and restart all 4 application microservices in one go, run this single block in your **EC2 Terminal**:

```bash
cd ~/LMS

# 1. Start system background daemons
sudo systemctl start redis6
sudo systemctl start nginx

# 2. Reset PM2 and cleanly launch all 4 microservices
pm2 delete all

# Service 1: Next.js Frontend & API Gateway (Port 3000)
pm2 start npm --name "nextjs-frontend" -- start -- -p 3000

# Service 2: Asynchronous Certificate Generation Queue Worker
pm2 start npm --name "certificate-worker" -- run worker

# Service 3: Standalone AI Study Assistant Microservice (Port 5000)
pm2 start npm --name "ai-microservice" -- run ai-service

# Service 4: Real-Time WebSocket Push Notification Service (Port 4000)
pm2 start npm --name "websocket-service" -- run ws-service

# 3. Save PM2 list so all 4 services survive future reboots
pm2 save

# 4. Check active status
pm2 status
```

---

## 4. Automated Permanent DuckDNS IP Assignment

### 🧠 Why did the IP change before?
When AWS EC2 instances are stopped and started without a static Elastic IP, AWS re-allocates a dynamic Public IPv4 address. 

To permanently automate this so you **never have to manually update DuckDNS again**, we configured an automated cron daemon that detects IP changes on boot and syncs with DuckDNS every 5 minutes.

---

### ⚙️ Complete Setup & Recovery Script for Auto IP Sync

If you ever need to reconfigure this on a new server, run:

```bash
# 1. Install cron daemon on Amazon Linux 2023
sudo dnf install -y cronie
sudo systemctl enable --now crond

# 2. Create the duckdns directory
mkdir -p ~/duckdns && cd ~/duckdns

# 3. Create the auto-update bash script
cat << 'EOF' > duck.sh
#!/bin/bash
DUCK_TOKEN="YOUR_DUCKDNS_TOKEN"
DOMAIN="learnportal"
echo url="https://www.duckdns.org/update?domains=${DOMAIN}&token=${DUCK_TOKEN}&ip=" | curl -k -o /home/ec2-user/duckdns/duck.log -K -
EOF

# 4. Make executable
chmod +x duck.sh

# 5. Add to system crontab (Runs on boot and every 5 minutes)
(crontab -l 2>/dev/null; echo "@reboot /home/ec2-user/duckdns/duck.sh >/dev/null 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ec2-user/duckdns/duck.sh >/dev/null 2>&1") | crontab -

# 6. Test execution
./duck.sh
cat duck.log
```
*Expected Output:* `OK`

---

### 🏆 Alternative: AWS Elastic IP (100% Static IPv4)
If you want an IP that **physically never changes** in AWS:
1. In AWS Console, go to **EC2 > Elastic IPs**.
2. Click **Allocate Elastic IP address** ➔ **Allocate**.
3. Click **Actions** ▾ ➔ **Associate Elastic IP address** ➔ select your EC2 instance.
4. Update DuckDNS once with this static Elastic IP.

---

## 5. Health Check & Verification Checklist

After any restart, verify that all layers of your stack are healthy:

```bash
# 1. Verify PM2 Services are Green & Online
pm2 status

# 2. Verify Redis Stream & Cache
redis-cli ping
# Output: PONG

# 3. Verify Nginx Ports (Listening on :80 and :443)
sudo ss -tulpn | grep nginx

# 4. Verify Local Next.js Server
curl -I http://127.0.0.1:3000/

# 5. Verify Public HTTPS Domain
curl -I https://learnportal.duckdns.org/
# Output: HTTP/1.1 200 OK or HTTP/2 200 OK
```

---

## 6. How to Connect via Windows SSH Terminal (No .pem Required)

Instead of relying on the AWS web console browser terminal, you can connect directly from your **Windows Command Prompt (`cmd`)**, **PowerShell**, or **VS Code Terminal** without needing the original AWS `.pem` key file.

---

### Step 1: Check or Generate Your Local SSH Key on Windows

In your **Windows Terminal (`cmd`)**:

```cmd
# 1. Check if you already have a key
type C:\Users\CHAND\.ssh\id_ed25519.pub
# (or type C:\Users\CHAND\.ssh\id_rsa.pub)

# 2. If no key exists, generate a new one (press Enter for all defaults):
ssh-keygen -t ed25519 -C "chand-laptop"
```

**Copy the output text** (it starts with `ssh-ed25519 AAAAC3Nza...` or `ssh-rsa AAAAB3Nza...`).

---

### Step 2: Add Your Public Key to EC2 (One-Time Setup)

Open the **AWS 1-Click Browser Terminal** on your instance and run:

```bash
# Append your Windows laptop public key to authorized_keys
echo "PASTE_YOUR_COPIED_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Ensure secure file permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

### Step 3: Connect Instantly from Windows Terminal! 🚀

Now, anytime you want to access your server, just open **Command Prompt (`cmd`)** or **PowerShell** on your PC and run:

```cmd
ssh ec2-user@learnportal.duckdns.org
```

*(You can also use your IP: `ssh ec2-user@51.20.54.184`)*

---

### 🌐 Direct Browser Access Links:
- **Homepage:** `https://learnportal.duckdns.org/`
- **Student Dashboard:** `https://learnportal.duckdns.org/Student-Dashboard`
- **Course Catalog:** `https://learnportal.duckdns.org/courses`

