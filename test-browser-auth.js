const https = require('https');
const http = require('http');
const querystring = require('querystring');

async function testBrowserAuth() {
  console.log('🌐 Testing browser-like authentication flow on Vercel...\n');
  
  const cookieJar = new Map(); // Simple cookie storage
  
  const makeRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      redirect: 'manual'
    });
    
    // Store cookies
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      setCookie.split(',').forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          cookieJar.set(name.trim(), value.trim());
        }
      });
    }
    
    return response;
  };
  
  const getCookieHeader = () => {
    return Array.from(cookieJar.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  };
  
  try {
    // Step 1: Visit the sign-in page (like a browser would)
    console.log('1️⃣ Visiting sign-in page...');
    const signInPageResponse = await makeRequest('https://saheminvest.vercel.app/auth/signin');
    console.log('Sign-in page status:', signInPageResponse.status);
    console.log('Cookies after page visit:', Array.from(cookieJar.keys()));
    
    // Step 2: Get CSRF token via API (with cookies)
    console.log('\n2️⃣ Getting CSRF token with session...');
    const csrfResponse = await makeRequest('https://saheminvest.vercel.app/api/auth/csrf', {
      headers: {
        'Cookie': getCookieHeader()
      }
    });
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken ? 'Retrieved ✅' : 'Missing ❌');
    console.log('Cookies after CSRF:', Array.from(cookieJar.keys()));
    
    if (!csrfData.csrfToken) {
      console.log('❌ Cannot proceed without CSRF token');
      return;
    }
    
    // Step 3: Submit credentials (simulating NextAuth signIn)
    console.log('\n3️⃣ Submitting credentials...');
    const signInData = querystring.stringify({
      email: 'admin@sahaminvest.com',
      password: 'Azerty@123123',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'https://saheminvest.vercel.app/admin',
      json: 'true'
    });
    
    const signInResponse = await makeRequest('https://saheminvest.vercel.app/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': getCookieHeader(),
        'Origin': 'https://saheminvest.vercel.app',
        'Referer': 'https://saheminvest.vercel.app/auth/signin'
      },
      body: signInData
    });
    
    console.log('Sign-in Status:', signInResponse.status);
    console.log('Sign-in Headers:', Object.fromEntries(signInResponse.headers.entries()));
    
    if (signInResponse.status === 200) {
      const result = await signInResponse.json();
      console.log('Sign-in Result:', result);
    } else {
      const location = signInResponse.headers.get('location');
      console.log('Redirect Location:', location);
      
      if (location && !location.includes('csrf=true')) {
        console.log('✅ Successful authentication - no CSRF error!');
        
        // Step 4: Check session
        console.log('\n4️⃣ Checking session...');
        const sessionResponse = await makeRequest('https://saheminvest.vercel.app/api/auth/session', {
          headers: {
            'Cookie': getCookieHeader()
          }
        });
        
        const sessionData = await sessionResponse.json();
        console.log('Session Data:', sessionData);
      } else {
        console.log('❌ Still getting CSRF error');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBrowserAuth();
