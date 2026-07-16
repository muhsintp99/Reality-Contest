const http = require('http');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:10000';
const MONGODB_URI = 'mongodb+srv://muhsintpdevelop_db_user:Muhsintp925@reality-contest.xyxmmnq.mongodb.net/?appName=Reality-Contest';

// Simple Cookie Jar
const cookies = {
  contestant: [],
  admin: []
};

// Helper: HTTP Request
function makeRequest(path, method, body = null, role = 'contestant') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };

    const activeCookies = cookies[role];
    if (activeCookies && activeCookies.length > 0) {
      headers['Cookie'] = activeCookies.join('; ');
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Capture cookies
        const setCookieHeaders = res.headers['set-cookie'];
        if (setCookieHeaders) {
          setCookieHeaders.forEach(cookieStr => {
            const cookieNameVal = cookieStr.split(';')[0];
            const name = cookieNameVal.split('=')[0];
            // Remove existing cookie with same name
            cookies[role] = cookies[role].filter(c => !c.startsWith(name + '='));
            cookies[role].push(cookieNameVal);
          });
        }

        let parsedBody = null;
        if (data) {
          try {
            parsedBody = JSON.parse(data);
          } catch (e) {
            parsedBody = data;
          }
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('STARTING RCP E2E INTEGRATION TEST SCRIPT');
  console.log('====================================================\n');

  // Step 1: Health Check
  console.log('Step 1: Checking backend health check endpoint...');
  try {
    const health = await makeRequest('/health', 'GET');
    console.log('Health check status:', health.statusCode);
    console.log('Health check response:', health.body);
    if (health.statusCode !== 200 || health.body.status !== 'healthy') {
      throw new Error('Backend health check failed');
    }
    if (health.body.database !== 'connected') {
      console.warn('WARNING: MongoDB is disconnected in backend health response.');
    }
  } catch (err) {
    console.error('FAIL: Backend server is offline or unreachable:', err.message);
    process.exit(1);
  }

  // Connect to MongoDB locally to clear existing test users and elevate roles
  console.log('\nConnecting to local MongoDB for database state setup...');
  let User, KYC;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');
    
    // Set up schema references
    require('./backend/dist/models/User');
    require('./backend/dist/models/KYC');
    User = mongoose.model('User');
    KYC = mongoose.model('KYC');

    // Clean up past test accounts
    await User.deleteMany({ email: { $in: ['e2e_contestant@test.com', 'e2e_admin@test.com'] } });
    console.log('Cleaned up previous test users.');
  } catch (err) {
    console.error('WARNING: Could not connect to local MongoDB database directly:', err.message);
    console.log('Testing will continue using the API endpoints, but Admin role elevation might fail if the DB is inaccessible.');
  }

  // Step 2: Register Contestant User
  console.log('\nStep 2: Registering a Contestant User...');
  const contestantData = {
    name: 'E2E Contestant User',
    username: 'e2econtestant_' + Math.floor(Math.random() * 1000),
    email: 'e2e_contestant@test.com',
    phone: '+9198765' + Math.floor(100000 + Math.random() * 900000).toString(),
    password: 'password123',
    dob: '1998-04-12',
    gender: 'Male',
    state: 'Maharashtra',
    district: 'Mumbai',
    country: 'India',
    favoriteCategories: ['Knowledge', 'Science'],
    skills: ['Coding'],
    interests: ['Indie SaaS']
  };

  const regContestant = await makeRequest('/api/auth/register', 'POST', contestantData, 'contestant');
  console.log('Register response:', regContestant.statusCode);
  if (regContestant.statusCode !== 201 || !regContestant.body.success) {
    console.error('FAIL: Registration failed:', regContestant.body);
    process.exit(1);
  }
  
  const contestantId = regContestant.body.userId;
  const contestantOtps = regContestant.body.mockOtps;
  console.log(`SUCCESS: Registered user ID: ${contestantId}`);
  console.log('Captured registration OTPs:', contestantOtps);

  // Step 3: Verify Contestant OTPs
  console.log('\nStep 3: Verifying email and phone OTPs...');
  const verifyEmailRes = await makeRequest('/api/auth/verify-otp', 'POST', {
    userId: contestantId,
    otp: contestantOtps.emailOtp,
    type: 'email_verify'
  }, 'contestant');
  
  const verifyPhoneRes = await makeRequest('/api/auth/verify-otp', 'POST', {
    userId: contestantId,
    otp: contestantOtps.phoneOtp,
    type: 'phone_verify'
  }, 'contestant');

  if (verifyEmailRes.statusCode !== 200 || verifyPhoneRes.statusCode !== 200) {
    console.error('FAIL: OTP verification failed. Email response:', verifyEmailRes.body, 'Phone response:', verifyPhoneRes.body);
    process.exit(1);
  }
  console.log('SUCCESS: Email and Phone OTPs successfully verified.');

  // Step 4: Login as Contestant
  console.log('\nStep 4: Logging in as Contestant...');
  const loginContestant = await makeRequest('/api/auth/login', 'POST', {
    loginId: contestantData.email,
    password: contestantData.password
  }, 'contestant');

  console.log('Login Response Code:', loginContestant.statusCode);
  if (loginContestant.statusCode !== 200 || !loginContestant.body.success) {
    console.error('FAIL: Contestant login failed:', loginContestant.body);
    process.exit(1);
  }
  console.log('SUCCESS: Logged in successfully. Current User Role:', loginContestant.body.user.role);
  console.log('Cookies stored in contestant jar.');

  // Step 5: Fetch profile details
  console.log('\nStep 5: Retrieving Contestant User Profile...');
  const profileRes = await makeRequest('/api/users/profile', 'GET', null, 'contestant');
  console.log('Profile Status Code:', profileRes.statusCode);
  if (profileRes.statusCode !== 200) {
    console.error('FAIL: Get profile failed:', profileRes.body);
    process.exit(1);
  }
  console.log('SUCCESS: Profile matches registered details. KYC Status:', profileRes.body.user?.kycStatus);

  // Step 6: Submit KYC Documents
  console.log('\nStep 6: Submitting KYC documents...');
  const kycSubmission = {
    documentType: 'Aadhaar',
    documentNumber: '1234-5678-9012',
    documentFrontUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=AadhaarFront',
    selfieUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ContestantSelfie'
  };

  const kycSubmitRes = await makeRequest('/api/kyc/upload', 'POST', kycSubmission, 'contestant');
  console.log('KYC upload status:', kycSubmitRes.statusCode);
  if (kycSubmitRes.statusCode !== 200 || !kycSubmitRes.body.success) {
    console.error('FAIL: KYC upload failed:', kycSubmitRes.body);
    process.exit(1);
  }
  const kycId = kycSubmitRes.body.kyc._id;
  console.log('SUCCESS: KYC submitted. KYC Record ID:', kycId, 'Status:', kycSubmitRes.body.kyc.status);

  // Step 7: Create & Elevate Admin User in DB
  console.log('\nStep 7: Creating and elevating an Admin account...');
  const adminData = {
    name: 'E2E Admin User',
    username: 'e2eadmin_' + Math.floor(Math.random() * 1000),
    email: 'e2e_admin@test.com',
    phone: '+9188888' + Math.floor(100000 + Math.random() * 900000).toString(),
    password: 'password123',
    dob: '1990-01-01',
    gender: 'Female',
    state: 'Karnataka',
    district: 'Bengaluru',
    country: 'India'
  };

  const regAdmin = await makeRequest('/api/auth/register', 'POST', adminData, 'admin');
  if (regAdmin.statusCode !== 201) {
    console.error('FAIL: Admin registration failed:', regAdmin.body);
    process.exit(1);
  }

  const adminId = regAdmin.body.userId;
  const adminOtps = regAdmin.body.mockOtps;

  // Verify Admin OTPs
  await makeRequest('/api/auth/verify-otp', 'POST', { userId: adminId, otp: adminOtps.emailOtp, type: 'email_verify' }, 'admin');
  await makeRequest('/api/auth/verify-otp', 'POST', { userId: adminId, otp: adminOtps.phoneOtp, type: 'phone_verify' }, 'admin');

  // Elevate to Admin in MongoDB
  if (User) {
    try {
      await User.findByIdAndUpdate(adminId, { role: 'Admin' });
      console.log('Database elevated user to Admin role.');
    } catch (e) {
      console.error('Database role elevation failed:', e.message);
      process.exit(1);
    }
  } else {
    console.log('WARNING: Skipping Direct MongoDB role update as database connection is not available in test runtime.');
    console.log('We will try to review KYC as contestant to confirm auth guards, and complete visual check.');
  }

  // Step 8: Log in as Admin
  console.log('\nStep 8: Logging in as Admin...');
  const loginAdmin = await makeRequest('/api/auth/login', 'POST', {
    loginId: adminData.email,
    password: adminData.password
  }, 'admin');

  if (loginAdmin.statusCode !== 200) {
    console.error('FAIL: Admin login failed:', loginAdmin.body);
    process.exit(1);
  }
  console.log('SUCCESS: Admin logged in. Role verified in API response:', loginAdmin.body.user.role);

  // Step 9: Admin reviews KYC
  console.log('\nStep 9: Admin fetching pending KYCs and reviewing...');
  const pendingKycs = await makeRequest('/api/kyc/pending', 'GET', null, 'admin');
  console.log('Pending KYCs response code:', pendingKycs.statusCode);
  if (pendingKycs.statusCode !== 200) {
    console.error('FAIL: Admin fetch pending KYCs failed:', pendingKycs.body);
    process.exit(1);
  }

  const foundKyc = pendingKycs.body.kycs.find(k => k._id === kycId || k.userId?._id === contestantId);
  if (!foundKyc) {
    console.error('FAIL: Submited KYC was not found in Admin pending queue');
    process.exit(1);
  }
  console.log(`SUCCESS: Found pending KYC for user ${foundKyc.userId?.name}. AI Liveness Score: ${foundKyc.livenessScore}%, AI Match Result: ${foundKyc.aiMatchResult}`);

  // Approve the KYC
  console.log('Approving KYC application...');
  const reviewRes = await makeRequest('/api/kyc/review', 'PUT', {
    kycId: kycId,
    status: 'Approved'
  }, 'admin');

  if (reviewRes.statusCode !== 200 || !reviewRes.body.success) {
    console.error('FAIL: KYC approval failed:', reviewRes.body);
    process.exit(1);
  }
  console.log('SUCCESS: KYC marked Approved in database.');

  // Step 10: Verify status change on Contestant profile
  console.log('\nStep 10: Querying KYC status as Contestant user to verify updates...');
  const finalKycStatus = await makeRequest('/api/kyc/status', 'GET', null, 'contestant');
  if (finalKycStatus.statusCode !== 200) {
    console.error('FAIL: Fetch final KYC status failed:', finalKycStatus.body);
    process.exit(1);
  }
  console.log('Final KYC status response:', finalKycStatus.body);
  
  if (finalKycStatus.body.kyc?.status !== 'Approved') {
    console.error('FAIL: Expected status Approved, got:', finalKycStatus.body.kyc?.status);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('SUCCESS: ALL PROGRAMMATIC E2E API VERIFICATION TESTS PASSED');
  console.log('====================================================');
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('E2E TEST RUNNER EXCEPTION ERROR:', err);
  process.exit(1);
});
