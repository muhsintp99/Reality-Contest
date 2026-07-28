const mongoose = require('mongoose');

async function check() {
  const uri = 'mongodb+srv://muhsintpdevelop_db_user:Muhsintp925@reality-contest.xyxmmnq.mongodb.net/?appName=Reality-Contest';
  await mongoose.connect(uri);
  
  console.log('--- ADMINS COLLECTION ---');
  try {
    const admins = await mongoose.connection.collection('admins').find({}).toArray();
    console.log(admins.map(u => ({ email: u.email, role: u.role, name: u.name })));
  } catch (err) {
    console.error('Error fetching admins:', err.message);
  }

  console.log('\n--- USERS COLLECTION ---');
  try {
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
  } catch (err) {
    console.error('Error fetching users:', err.message);
  }
  
  process.exit(0);
}
check();
