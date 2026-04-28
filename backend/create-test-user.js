const bcrypt = require('bcryptjs');
const db = require('./config/db');

// Test user credentials
const testUser = {
  name: 'Test Advocate',
  email: 'test@law.com',
  password: 'password123',
  phone: '9999999999'
};

// Hash the password
const hashedPassword = bcrypt.hashSync(testUser.password, 10);

console.log('Creating test user...');
console.log('Email:', testUser.email);
console.log('Password:', testUser.password);

// Delete existing test users
db.query('DELETE FROM advocates WHERE email IN (?, ?)', 
  ['test@law.com', 'john.smith@law.com'],
  (err) => {
    if (err) {
      console.error('Error deleting old users:', err.message);
      return;
    }

    // Insert new test user
    db.query(
      'INSERT INTO advocates (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [testUser.name, testUser.email, hashedPassword, testUser.phone],
      (err, result) => {
        if (err) {
          console.error('❌ Error creating test user:', err.message);
          process.exit(1);
        }

        console.log('\n✅ Test user created successfully!');
        console.log('User ID:', result.insertId);
        console.log('\n📝 Login credentials:');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);
        console.log('\nYou can now login with these credentials.');
      }
    );
  }
);
