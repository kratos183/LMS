import crypto from 'crypto';

const TARGET_URL = process.argv[2] || 'http://127.0.0.1:3000/api/webhooks/razorpay';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_edupress_2026';
const SCENARIO = process.argv[3] || 'VALID'; // VALID | DUPLICATE | TAMPERED

async function runSimulator() {
  console.log(`\n======================================================`);
  console.log(`💳 \x1b[36m[Razorpay Cryptographic Webhook Simulator]\x1b[0m`);
  console.log(`🎯 Target URL: \x1b[1m${TARGET_URL}\x1b[0m`);
  console.log(`🔑 Secret Key: ${WEBHOOK_SECRET.substring(0, 8)}...`);
  console.log(`🎭 Scenario: \x1b[33m${SCENARIO}\x1b[0m`);
  console.log(`======================================================\n`);

  const paymentId = SCENARIO === 'DUPLICATE' ? 'pay_DEMO_REPLAY_1001' : `pay_${Date.now()}`;
  const orderId = `order_${Date.now()}`;
  const amountInPaise = 99900; // ₹999.00

  const payloadObject = {
    entity: 'event',
    account_id: 'acc_demo123456',
    event: 'payment.captured',
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: paymentId,
          entity: 'payment',
          amount: amountInPaise,
          currency: 'INR',
          status: 'captured',
          order_id: orderId,
          invoice_id: null,
          international: false,
          method: 'upi',
          amount_refunded: 0,
          refund_status: null,
          captured: true,
          description: 'Course Enrollment: Full Stack Web Development',
          card_id: null,
          bank: null,
          wallet: null,
          vpa: 'student@okhdfcbank',
          email: 'ethan.hunt@example.com',
          contact: '+919876543210',
          notes: {
            courseId: 'course_nextjs_fullstack',
            courseTitle: 'Full Stack Next.js & System Architecture',
            studentName: 'Ethan Hunt',
          },
          fee: 1998,
          tax: 304,
          error_code: null,
          error_description: null,
          created_at: Math.floor(Date.now() / 1000),
        },
      },
    },
    created_at: Math.floor(Date.now() / 1000),
  };

  const rawBody = JSON.stringify(payloadObject);

  // Compute authentic HMAC-SHA256 signature
  let signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (SCENARIO === 'TAMPERED') {
    // Malicious attacker altered the signature
    signature = 'fake_tampered_signature_' + Math.random().toString(36).substring(2);
    console.log(`⚠️ \x1b[31m[Attacker Test]\x1b[0m Sending forged signature: ${signature.substring(0, 16)}...`);
  } else {
    console.log(`🔐 \x1b[32m[Valid Signature]\x1b[0m Computed HMAC-SHA256: ${signature.substring(0, 16)}...`);
  }

  const startTime = performance.now();

  try {
    const res = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature,
        'X-Razorpay-Event-Id': `evt_${Date.now()}`,
      },
      body: rawBody,
    });

    const status = res.status;
    const data = await res.json();
    const duration = Math.round(performance.now() - startTime);

    console.log(`\n📬 Response Status: \x1b[1mHTTP ${status} (${duration}ms)\x1b[0m`);
    console.log(`📦 Response Body:`, JSON.stringify(data, null, 2));

    if (status === 200 && data.status === 'CAPTURED') {
      console.log(`\n🎉 \x1b[32m[TEST PASSED]\x1b[0m Webhook cryptographically verified & enrollment processed!`);
    } else if (status === 200 && data.status === 'ALREADY_PROCESSED') {
      console.log(`\n🛡️ \x1b[33m[IDEMPOTENCY PASSED]\x1b[0m Replay attack detected and ignored gracefully!`);
    } else if (status === 400) {
      console.log(`\n🛡️ \x1b[32m[SECURITY TEST PASSED]\x1b[0m Forged webhook correctly rejected with 400 Bad Request!`);
    }
  } catch (err: any) {
    console.error(`\x1b[31m❌ Connection failed:\x1b[0m`, err.message);
  }
}

runSimulator();
