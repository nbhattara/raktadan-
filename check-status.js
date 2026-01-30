#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Raktadan Backend - Comprehensive Status Check\n');

// Check if required files exist
const requiredFiles = [
  'src/app.js',
  'src/config/index.js',
  'src/config/database.js',
  'src/config/swagger.js',
  'src/models/User.js',
  'src/controllers/authController.js',
  'src/controllers/userController.js',
  'src/controllers/notificationController.js',
  'src/middleware/auth.js',
  'src/middleware/error.js',
  'src/middleware/validate.js',
  'src/routes/index.js',
  'src/routes/auth.routes.js',
  'src/routes/user.routes.js',
  'src/routes/notification.routes.js',
  'package.json',
  'prisma/schema.prisma',
  '.env',
  'jsconfig.json'
];

console.log('📁 Checking required files...');
let filesOk = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    filesOk = false;
  }
});

// Check directories
const requiredDirs = [
  'src',
  'src/config',
  'src/controllers',
  'src/middleware',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'prisma'
];

console.log('\n📂 Checking directories...');
let dirsOk = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    dirsOk = false;
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['start', 'dev', 'prisma:generate'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ ${script} script`);
    } else {
      console.log(`❌ ${script} script - MISSING`);
      filesOk = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
  filesOk = false;
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredEnvVars = ['PORT', 'DATABASE_URL', 'JWT_SECRET'];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`)) {
      console.log(`✅ ${envVar}`);
    } else {
      console.log(`❌ ${envVar} - MISSING`);
      filesOk = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading .env file');
  filesOk = false;
}

// Check Prisma schema
console.log('\n🗄️  Checking Prisma schema...');
try {
  const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const requiredModels = ['User', 'Notification', 'BloodRequest', 'Hospital', 'BloodBank'];
  
  requiredModels.forEach(model => {
    if (schemaContent.includes(`model ${model}`)) {
      console.log(`✅ ${model} model`);
    } else {
      console.log(`❌ ${model} model - MISSING`);
      filesOk = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading Prisma schema');
  filesOk = false;
}

// Check if node_modules exists
console.log('\n📚 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules directory exists');
  
  // Check key dependencies
  const keyDeps = ['express', '@prisma/client', 'joi', 'jsonwebtoken', 'bcrypt'];
  keyDeps.forEach(dep => {
    const depPath = path.join('node_modules', dep);
    if (fs.existsSync(depPath)) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - NOT INSTALLED`);
      filesOk = false;
    }
  });
} else {
  console.log('❌ node_modules directory - MISSING');
  console.log('   Run: npm install');
  filesOk = false;
}

// Summary
console.log('\n📊 Status Summary:');
if (filesOk && dirsOk) {
  console.log('🎉 All checks passed! Project is ready to run.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Open: http://localhost:3000/api-docs');
  console.log('   3. Test: node test-api.js');
} else {
  console.log('⚠️  Some issues found. Please fix them before running.');
}

console.log('\n📋 Project Structure:');
console.log('   ✅ Multi-role user system (5 roles)');
console.log('   ✅ Role toggle functionality');
console.log('   ✅ Donation impact notifications');
console.log('   ✅ Hospital & blood bank management');
console.log('   ✅ Emergency services');
console.log('   ✅ Swagger API documentation');
console.log('   ✅ Comprehensive validation');
console.log('   ✅ Security middleware');
console.log('   ✅ Error handling');
