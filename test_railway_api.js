const https = require('https');

const RAILWAY_URL = 'https://ibdpal-server-production.up.railway.app';

// Test function to make HTTPS requests
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'ibdpal-server-production.up.railway.app',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'IBDPal-Test-Script'
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        console.log(`🌐 Making ${method} request to: ${RAILWAY_URL}${path}`);
        if (data) {
            console.log('📦 Request data:', JSON.stringify(data, null, 2));
        }

        const req = https.request(options, (res) => {
            console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
            console.log(`📋 Response Headers:`, res.headers);

            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`📄 Response Body:`, responseData);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: responseData
                });
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request error:`, error);
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test all endpoints
async function testRailwayAPI() {
    console.log('🧪 Testing Railway API endpoints...\n');

    try {
        // Test 1: Health check
        console.log('=== Test 1: Health Check ===');
        await makeRequest('/api/health');
        console.log('');

        // Test 2: Test endpoint
        console.log('=== Test 2: Test Endpoint ===');
        await makeRequest('/api/journal/test');
        console.log('');

        // Test 3: Journal entries endpoint (GET)
        console.log('=== Test 3: Journal Entries (GET) ===');
        await makeRequest('/api/journal/entries/aryan.skumar17@gmail.com');
        console.log('');

        // Test 4: Journal entries endpoint (POST) - Breakfast
        console.log('=== Test 4: Journal Entries (POST) - Breakfast ===');
        const breakfastData = {
            username: 'aryan.skumar17@gmail.com',
            entry_date: '2025-07-24',
            breakfast: 'Test breakfast from script',
            breakfast_calories: 300
        };
        await makeRequest('/api/journal/entries', 'POST', breakfastData);
        console.log('');

        // Test 5: Auth login
        console.log('=== Test 5: Auth Login ===');
        const loginData = {
            email: 'aryan.skumar17@gmail.com',
            password: 'Welcome1'
        };
        await makeRequest('/api/auth/login', 'POST', loginData);
        console.log('');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
testRailwayAPI(); 