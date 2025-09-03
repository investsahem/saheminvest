const https = require('https');
const http = require('http');
const querystring = require('querystring');

async function testLocalAuth() {
  console.log('🧪 Testing localhost authentication flow...\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken ? 'Retrieved ✅' : 'Missing ❌');
    
    if (!csrfData.csrfToken) {
      console.log('❌ Cannot proceed without CSRF token');
      return;
    }
    
    // Step 2: Test sign-in
    console.log('\n2️⃣ Testing sign-in...');
    const signInData = querystring.stringify({
      email: 'admin@sahaminvest.com',
      password: 'Azerty@123123',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3000/admin'
    });
    
    const signInResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(signInData)
      },
      body: signInData,
      redirect: 'manual' // Don't follow redirects automatically
    });
    
    console.log('Sign-in Status:', signInResponse.status);
    console.log('Sign-in Headers:', Object.fromEntries(signInResponse.headers.entries()));
    
    if (signInResponse.status === 302) {
      const location = signInResponse.headers.get('location');
      console.log('Redirect Location:', location);
      
      // Check if cookies were set
      const cookies = signInResponse.headers.get('set-cookie');
      console.log('Cookies Set:', cookies ? 'Yes ✅' : 'No ❌');
      if (cookies) {
        console.log('Cookie Details:', cookies);
      }
      
      // Step 3: Follow the redirect with cookies
      if (cookies && location) {
        console.log('\n3️⃣ Following redirect with session cookie...');
        
        const followResponse = await fetch(location, {
          method: 'GET',
          headers: {
            'Cookie': cookies.split(',').map(c => c.split(';')[0]).join('; ')
          },
          redirect: 'manual'
        });
        
        console.log('Follow Status:', followResponse.status);
        console.log('Follow Location:', followResponse.headers.get('location') || 'No redirect');
        
        // Step 4: Check session
        console.log('\n4️⃣ Checking session...');
        const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
          headers: {
            'Cookie': cookies.split(',').map(c => c.split(';')[0]).join('; ')
          }
        });
        
        const sessionData = await sessionResponse.json();
        console.log('Session Data:', sessionData);
      }
    } else {
      const responseText = await signInResponse.text();
      console.log('Response Body:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLocalAuth();
