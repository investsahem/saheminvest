const https = require('https');
const querystring = require('querystring');

// Test authentication flow
async function testAuthFlow() {
  console.log('🧪 Testing authentication flow on Vercel...\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const csrfResponse = await fetch('https://saheminvest.vercel.app/api/auth/csrf');
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
      callbackUrl: 'https://saheminvest.vercel.app/admin'
    });
    
    const signInResponse = await fetch('https://saheminvest.vercel.app/api/auth/signin/credentials', {
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
    } else {
      const responseText = await signInResponse.text();
      console.log('Response Body:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthFlow();
