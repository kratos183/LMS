const TARGET_URL = process.argv[2] || 'http://127.0.0.1:3000/api/ai/chat';
const TEST_EMAIL = `test_student_${Date.now()}@example.com`;

async function runRateLimitTest() {
  console.log(`\n======================================================`);
  console.log(`🛡️ \x1b[36m[Redis Sliding Window Rate Limit Tester (Concept #28)]\x1b[0m`);
  console.log(`🎯 Target Endpoint: \x1b[1m${TARGET_URL}\x1b[0m`);
  console.log(`👤 Client Identifier: ${TEST_EMAIL}`);
  console.log(`⏱️ Quota Limit: \x1b[33m10 AI queries / minute\x1b[0m`);
  console.log(`🚀 Sending 12 rapid sequential queries...`);
  console.log(`======================================================\n`);

  let allowedCount = 0;
  let blockedCount = 0;

  for (let i = 1; i <= 12; i++) {
    const startTime = performance.now();
    try {
      const res = await fetch(TARGET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: `Test query #${i}: What is React Hooks?` }],
          studentContext: {
            name: 'Ethan Hunt',
            email: TEST_EMAIL,
          },
        }),
      });

      const latency = Math.round(performance.now() - startTime);
      const remaining = res.headers.get('x-ratelimit-remaining') || 'N/A';
      const resetTime = res.headers.get('x-ratelimit-reset') || '60s';
      const data = await res.json();

      if (res.status === 200) {
        allowedCount++;
        console.log(
          `✅ \x1b[32m[Request #${i.toString().padStart(2, '0')}]\x1b[0m HTTP 200 OK (${latency}ms) | Remaining: \x1b[1m${remaining}/10\x1b[0m | Reset: ${resetTime}`
        );
      } else if (res.status === 429) {
        blockedCount++;
        console.log(
          `🚫 \x1b[31m[Request #${i.toString().padStart(2, '0')}]\x1b[0m HTTP 429 Too Many Requests (${latency}ms) | \x1b[31mTHROTTLED\x1b[0m | Retry-After: ${data.retryAfter}s`
        );
      } else {
        console.log(`⚠️ [Request #${i}] HTTP ${res.status}:`, data);
      }
    } catch (err: any) {
      console.error(`❌ Request #${i} connection error:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 \x1b[1mTEST SUMMARY:\x1b[0m`);
  console.log(`   🟢 Allowed Requests within Quota: \x1b[32m${allowedCount}/10\x1b[0m`);
  console.log(`   🔴 Throttled Requests (Rate Limited): \x1b[31m${blockedCount}/2\x1b[0m`);

  if (allowedCount === 10 && blockedCount === 2) {
    console.log(`\n🎉 \x1b[32m[SUCCESS]\x1b[0m Rate limiting is 100% functional! AI quota exhaustion prevented!`);
  }
  console.log(`======================================================\n`);
}

runRateLimitTest();
