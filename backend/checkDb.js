const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/blg-sponsor'); // Adjust DB name if needed. Or I can check `.env`
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}
check();
