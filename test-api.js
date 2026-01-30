#!/usr/bin/env node

const http = require('http');

// Test endpoints
const tests = [
  { path: '/', method: 'GET', description: 'Root endpoint' },
  { path: '/health', method: 'GET', description: 'Health check' },
  { path: '/api-docs', method: 'GET', description: 'Swagger documentation' },
  { path: '/docs', method: 'GET', description: 'API documentation' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          endpoint: endpoint.description,
          path: endpoint.path,
          status: res.statusCode,
          success: res.statusCode < 400,
          response: data.substring(0, 200) + (data.length > 200 ? '...' : '')
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint: endpoint.description,
        path: endpoint.path,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Raktadan API Endpoints...\n');
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing: ${test.description} (${test.path})`);
    const result = await testEndpoint(test);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status} - ${result.endpoint}`);
    } else {
      console.log(`❌ ${result.status} - ${result.endpoint}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    console.log('');
  }
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! API is working correctly.');
    console.log('\n📚 Available endpoints:');
    console.log('   - Swagger UI: http://localhost:3000/api-docs');
    console.log('   - API Docs: http://localhost:3000/docs');
    console.log('   - Health: http://localhost:3000/health');
    console.log('   - Root: http://localhost:3000/');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server status.');
  }
}

// Check if server is running
function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on port 3000');
    console.log('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  await runTests();
}

main().catch(console.error);
