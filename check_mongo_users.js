require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({}).select('name email role createdAt').lean();
    
    console.log(`📊 Total Users: ${users.length}\n`);
    console.log('━'.repeat(80));
    console.log('NAME'.padEnd(25) + 'EMAIL'.padEnd(35) + 'ROLE'.padEnd(15) + 'CREATED');
    console.log('━'.repeat(80));
    
    users.forEach(user => {
      console.log(
        (user.name || 'N/A').padEnd(25) +
        (user.email || 'N/A').padEnd(35) +
        (user.role || 'N/A').padEnd(15) +
        (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A')
      );
    });
    
    console.log('━'.repeat(80));
    
    // Group by role
    const roleGroups = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📋 Users by Role:');
    Object.entries(roleGroups).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

checkUsers();
