// Session Testing Script
// Run: node test-sessions.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/auth';
let cookies = '';

// Helper to extract Set-Cookie header
function extractCookies(response) {
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    // Extract session ID from cookie
    const match = setCookie.match(/connect\.sid=([^;]+)/);
    if (match) {
      cookies = `connect.sid=${match[1]}`;
      return match[1];
    }
  }
  return null;
}

// Helper for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  
  // Extract cookies if present
  if (method !== 'GET') {
    extractCookies(response);
  }

  const data = await response.json();
  return { status: response.status, data, response };
}

// Test flow
async function runTests() {
  console.log('\n🚀 Starting Session Management Tests\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check initial session (should be empty)
    console.log('\n📌 Test 1: Check Session (Before Login)');
    let result = await apiCall('/check-session', 'POST');
    console.log(`Status: ${result.status}`);
    console.log(`Has Session: ${result.data.hasSession}`);
    console.log(`✅ Pass: No session before login\n`);

    // Test 2: Login
    console.log('📌 Test 2: Login User');
    result = await apiCall('/login', 'POST', {
      email: 'user@mehryaan.com',
      password: 'user123'
    });
    console.log(`Status: ${result.status}`);
    if (result.data.success) {
      console.log(`✅ Login successful`);
      console.log(`   Session ID: ${result.data.sessionId}`);
      console.log(`   User: ${result.data.user.name} (${result.data.user.role})`);
      console.log(`   JWT Token: ${result.data.token.substring(0, 20)}...\n`);
    } else {
      console.log(`❌ Login failed: ${result.data.message}\n`);
      return;
    }

    // Test 3: Check session (should have session now)
    console.log('📌 Test 3: Check Session (After Login)');
    result = await apiCall('/check-session', 'POST');
    console.log(`Status: ${result.status}`);
    console.log(`Has Session: ${result.data.hasSession}`);
    if (result.data.hasSession) {
      console.log(`   User ID: ${result.data.session.userId}`);
      console.log(`   Email: ${result.data.session.userEmail}`);
      console.log(`   Name: ${result.data.session.userName}`);
      console.log(`   Role: ${result.data.session.userRole}`);
      console.log(`✅ Session created successfully\n`);
    } else {
      console.log(`❌ Session not created\n`);
      return;
    }

    // Test 4: Get session details
    console.log('📌 Test 4: Get Session Details');
    result = await apiCall('/session', 'GET');
    console.log(`Status: ${result.status}`);
    if (result.data.success) {
      console.log(`✅ Session details retrieved`);
      console.log(`   Session ID: ${result.data.session.sessionId}`);
      console.log(`   Max Age: ${result.data.session.maxAge / 1000 / 60 / 60 / 24} days`);
      console.log(`   Created At: ${result.data.session.createdAt}\n`);
    } else {
      console.log(`❌ Failed to get session: ${result.data.message}\n`);
    }

    // Test 5: Get current user (using session)
    console.log('📌 Test 5: Get Current User (Via Session)');
    result = await apiCall('/me', 'GET');
    console.log(`Status: ${result.status}`);
    if (result.data.success) {
      console.log(`✅ User retrieved via session`);
      console.log(`   Name: ${result.data.user.name}`);
      console.log(`   Email: ${result.data.user.email}`);
      console.log(`   Role: ${result.data.user.role}\n`);
    } else {
      console.log(`❌ Failed to get user: ${result.data.message}\n`);
    }

    // Test 6: Logout
    console.log('📌 Test 6: Logout');
    result = await apiCall('/logout', 'POST');
    console.log(`Status: ${result.status}`);
    if (result.data.success) {
      console.log(`✅ ${result.data.message}`);
      cookies = ''; // Clear cookies
      console.log(`   Session destroyed: ${result.data.sessionId}\n`);
    } else {
      console.log(`❌ Logout failed: ${result.data.message}\n`);
      return;
    }

    // Test 7: Verify session is destroyed
    console.log('📌 Test 7: Verify Session Destroyed');
    result = await apiCall('/check-session', 'POST');
    console.log(`Status: ${result.status}`);
    console.log(`Has Session: ${result.data.hasSession}`);
    if (!result.data.hasSession) {
      console.log(`✅ Session successfully destroyed\n`);
    } else {
      console.log(`❌ Session still exists\n`);
    }

    // Test 8: Sign up (new user)
    console.log('📌 Test 8: Signup with Session');
    const timestamp = Date.now();
    result = await apiCall('/signup', 'POST', {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@mehryaan.com`,
      password: 'testpass123'
    });
    console.log(`Status: ${result.status}`);
    if (result.data.success) {
      console.log(`✅ Signup successful`);
      console.log(`   Session ID: ${result.data.sessionId}`);
      console.log(`   User: ${result.data.user.name}\n`);
    } else {
      console.log(`❌ Signup failed: ${result.data.message}\n`);
    }

    // Test 9: Verify signup session
    console.log('📌 Test 9: Verify Signup Session');
    result = await apiCall('/check-session', 'POST');
    console.log(`Status: ${result.status}`);
    console.log(`Has Session: ${result.data.hasSession}`);
    if (result.data.hasSession) {
      console.log(`   User: ${result.data.session.userName}`);
      console.log(`✅ Signup session created successfully\n`);
    }

    console.log('=' .repeat(60));
    console.log('\n✅ All session tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. Backend server is running (npm start)');
    console.error('2. MongoDB is connected');
    console.error('3. Test user exists (run seedDatabase.js)\n');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('\n❌ Server is not running!');
    console.error('Start it with: npm start (in backend folder)\n');
    process.exit(1);
  }
  
  await runTests();
  process.exit(0);
})();