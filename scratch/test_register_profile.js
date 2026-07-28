const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:10002/api/auth/register/profile', {
      sessionId: 'test-session-id',
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      dob: '1995-05-15',
      gender: 'Male',
      state: 'Kerala',
      district: 'Ernakulam',
      city: 'Kochi',
      preferredLanguage: 'English',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RCP-Onboarding',
      pincode: '',
      occupation: '',
      education: '',
      employmentStatus: 'Student',
      notificationPermission: true,
      locationPermission: false
    });
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Status:', err.response?.status);
    console.error('Error Details:', JSON.stringify(err.response?.data, null, 2));
  }
}

test();
