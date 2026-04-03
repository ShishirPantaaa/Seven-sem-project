const db = require('./config/database');
const bcrypt = require('bcrypt');
const util = require('util');

const query = util.promisify(db.query).bind(db);

async function setupAdmin() {
  try {
    const DB_NAME = process.env.DB_NAME || "sevensem_project";
    
    // Use database
    await new Promise((resolve, reject) => {
      db.query(`USE ${DB_NAME}`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if admin_users table exists
    const tableCheck = await query(`
      SELECT COUNT(*) as count FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'
    `, [DB_NAME]);

    if (tableCheck[0].count === 0) {
      console.log('Creating admin_users table...');
      await query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          admin_id INT AUTO_INCREMENT PRIMARY KEY,
          admin_username VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          admin_name VARCHAR(255) NOT NULL,
          email VARCHAR(150),
          role ENUM('admin', 'superadmin') DEFAULT 'admin',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ admin_users table created');
    } else {
      console.log('✓ admin_users table already exists');
    }

    // Check if default admin exists
    const adminExists = await query(
      'SELECT * FROM admin_users WHERE admin_username = ?',
      ['admin']
    );

    if (adminExists.length > 0) {
      const hashedPassword = await bcrypt.hash('Project', 10);
      await query(
        'UPDATE admin_users SET password_hash = ? WHERE admin_username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✓ Default admin user already exists');
      console.log('✓ Admin password reset to Project');
    } else {
      console.log('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('Project', 10);
      
      await query(
        'INSERT INTO admin_users (admin_username, password_hash, admin_name, email, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'System Administrator', 'admin@pulsequeue.local', 'superadmin']
      );
      console.log('✓ Default admin user created successfully');
      console.log('Credentials: admin / Project');
    }

    console.log('\n✓ Setup complete! You can now login with:');
    console.log('  Admin ID: admin');
    console.log('  Password: Project');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
