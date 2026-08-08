const mongoose = require('mongoose');

async function clearQuestionsData() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://muhsintpdevelop_db_user:Muhsintp925@reality-contest.xyxmmnq.mongodb.net/?appName=Reality-Contest';
  
  console.log('Connecting to MongoDB database to clear questions...');
  await mongoose.connect(uri);

  try {
    const questionsRes = await mongoose.connection.collection('questions').deleteMany({});
    console.log(`Deleted ${questionsRes.deletedCount} items from 'questions' collection.`);
  } catch (err) {
    console.error('Error clearing questions collection:', err.message);
  }

  try {
    const poolsRes = await mongoose.connection.collection('questionpools').deleteMany({});
    console.log(`Deleted ${poolsRes.deletedCount} items from 'questionpools' collection.`);
  } catch (err) {
    console.error('Error clearing questionpools collection:', err.message);
  }

  console.log('Question bank database successfully cleared!');
  process.exit(0);
}

clearQuestionsData();
