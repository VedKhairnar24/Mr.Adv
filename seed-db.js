/**
 * Database Seeding Script
 * Creates test data for development and testing
 */

require('dotenv').config();
const db = require('./backend/config/db');
const bcrypt = require('./backend/node_modules/bcryptjs');

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test connection
    console.log('✓ Database connection established');

    // Insert test advocate
    const testAdvocateEmail = 'test@advocate.com';
    const testPassword = 'password123';
    const hashedPassword = bcrypt.hashSync(testPassword, 10);

    console.log('\n📝 Creating test advocate...');
    
    const advocateSQL = `
      INSERT INTO advocates (name, email, password, phone, created_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE id=id
    `;

    db.query(
      advocateSQL,
      ['Test Advocate', testAdvocateEmail, hashedPassword, '9999999999'],
      (err, result) => {
        if (err) {
          console.error('❌ Failed to insert advocate:', err.message);
          process.exit(1);
        }

        console.log('✓ Test advocate created/updated');
        
        // Get the advocate ID
        const getAdvocateSQL = 'SELECT id FROM advocates WHERE email = ?';
        db.query(getAdvocateSQL, [testAdvocateEmail], (err, rows) => {
          if (err) {
            console.error('❌ Failed to fetch advocate:', err.message);
            process.exit(1);
          }

          const advocateId = rows[0].id;
          console.log(`✓ Advocate ID: ${advocateId}`);

          // Insert test clients
          console.log('\n📝 Creating test clients...');
          
          const clientsSQL = `
            INSERT INTO clients (advocate_id, name, phone, email, address, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
          `;

          const clients = [
            [advocateId, 'Ramesh Kumar', '9111111111', 'ramesh@email.com', 'A-123, Sector 15, New Delhi'],
            [advocateId, 'Sunita Devi', '9222222222', 'sunita@email.com', 'B-456, Lajpat Nagar, Delhi'],
            [advocateId, 'Mohammad Arif', '9333333333', 'arif@email.com', 'C-789, Jamia Nagar, Delhi'],
          ];

          let clientsInserted = 0;

          clients.forEach((clientData, index) => {
            db.query(clientsSQL, clientData, (err, result) => {
              if (err) {
                console.error(`❌ Failed to insert client ${index + 1}:`, err.message);
              } else {
                clientsInserted++;
                console.log(`✓ Client ${index + 1} created`);
                
                // After all clients are inserted, show completion message
                if (clientsInserted === clients.length) {
                  console.log('\n✅ Database seeding completed successfully!');
                  console.log('\n📌 Login credentials:');
                  console.log(`   Email: ${testAdvocateEmail}`);
                  console.log(`   Password: ${testPassword}`);
                  console.log(`\n📌 Test data created:`);
                  console.log(`   - 1 Advocate`);
                  console.log(`   - 3 Clients`);
                  console.log('\n🚀 You can now login and test the application.\n');
                  process.exit(0);
                }
              }
            });
          });
        });
      }
    );
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
