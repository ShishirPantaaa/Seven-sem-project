const db = require('./config/database');
const DB_NAME = process.env.DB_NAME || "sevensem_project";

// Create tables if they don't exist
const createTables = () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      otp VARCHAR(6),
      otp_expiry DATETIME,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const departmentsTable = `
    CREATE TABLE IF NOT EXISTS departments (
      department_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const doctorsTable = `
    CREATE TABLE IF NOT EXISTS doctors (
      doctor_id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_name VARCHAR(255) NOT NULL,
      department_id INT,
      status ENUM('available', 'unavailable') DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(department_id)
    );
  `;

  const patientsTable = `
    CREATE TABLE IF NOT EXISTS patients (
      patient_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      gender VARCHAR(10) NOT NULL,
      contact VARCHAR(20),
      address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const tokensTable = `
    CREATE TABLE IF NOT EXISTS tokens (
      token_id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      token_number INT NOT NULL,
      status ENUM('waiting', 'completed') DEFAULT 'waiting',
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      eta_time DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    );
  `;

  db.query(usersTable, (err) => {
    if (err) {
      console.log('Error creating users table:', err);
    } else {
      console.log('Users table ready');

      // Ensure required columns exist by checking information_schema.
      const ensureColumn = (columnName, ddl) => {
        const checkSql = `
          SELECT COUNT(*) AS count
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = ?
        `;
        db.query(checkSql, [DB_NAME, columnName], (checkErr, results) => {
          if (checkErr) {
            console.log(`Error checking column ${columnName}:`, checkErr);
            return;
          }
          const exists = results?.[0]?.count > 0;
          if (!exists) {
            db.query(ddl, (alterErr) => {
              if (alterErr) {
                console.log(`Error creating column ${columnName}:`, alterErr);
              }
            });
          }
        });
      };

      ensureColumn('otp', 'ALTER TABLE users ADD COLUMN otp VARCHAR(6)');
      ensureColumn('otp_expiry', 'ALTER TABLE users ADD COLUMN otp_expiry DATETIME');
      ensureColumn('verified', 'ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE');
      ensureColumn('password', 'ALTER TABLE users ADD COLUMN password VARCHAR(255)');

      // If we have an old password_hash column, copy values into the new "password" column.
      const copyPasswordHash = `
        UPDATE users
        SET password = password_hash
        WHERE password IS NULL AND password_hash IS NOT NULL
      `;
      db.query(copyPasswordHash, (copyErr) => {
        if (copyErr) {
          // ignore missing column errors or if password already exists
          if (copyErr.code !== 'ER_BAD_FIELD_ERROR') {
            console.log('Error copying password_hash to password:', copyErr);
          }
        }
      });
    }
  });

  db.query(departmentsTable, (err) => {
    if (err) console.log('Error creating departments table:', err);
    else console.log('Departments table ready');
  });

  db.query(patientsTable, (err) => {
    if (err) {
      console.log('Error creating patients table:', err);
    } else {
      console.log('Patients table ready');

      const ensurePatientColumn = (columnName, ddl) => {
        const checkSql = `
          SELECT COUNT(*) AS count
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME = 'patients'
            AND COLUMN_NAME = ?
        `;
        db.query(checkSql, [DB_NAME, columnName], (checkErr, results) => {
          if (checkErr) {
            console.log(`Error checking patients column ${columnName}:`, checkErr);
            return;
          }

          const exists = results?.[0]?.count > 0;
          if (!exists) {
            db.query(ddl, (alterErr) => {
              if (alterErr) {
                console.log(`Error creating patients column ${columnName}:`, alterErr);
              }
            });
          }
        });
      };

      ensurePatientColumn('contact', 'ALTER TABLE patients ADD COLUMN contact VARCHAR(20)');
    }
  });

  db.query(doctorsTable, (err) => {
    if (err) console.log('Error creating doctors table:', err);
    else console.log('Doctors table ready');
  });

  db.query(tokensTable, (err) => {
    if (err) {
      console.log('Error creating tokens table:', err);
    } else {
      console.log('Tokens table ready');

      // Ensure ETA column exists for backward compatibility.
      const ensureTokenColumn = (columnName, ddl) => {
        const checkSql = `
          SELECT COUNT(*) AS count
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME = 'tokens'
            AND COLUMN_NAME = ?
        `;
        db.query(checkSql, [DB_NAME, columnName], (checkErr, results) => {
          if (checkErr) {
            console.log(`Error checking column ${columnName}:`, checkErr);
            return;
          }
          const exists = results?.[0]?.count > 0;
          if (!exists) {
            db.query(ddl, (alterErr) => {
              if (alterErr) {
                console.log(`Error creating column ${columnName}:`, alterErr);
              }
            });
          }
        });
      };

      ensureTokenColumn('appointment_date', 'ALTER TABLE tokens ADD COLUMN appointment_date DATE');
      ensureTokenColumn('appointment_time', 'ALTER TABLE tokens ADD COLUMN appointment_time TIME');
      ensureTokenColumn('eta_time', 'ALTER TABLE tokens ADD COLUMN eta_time DATETIME');
    }
  });
};

// Ensure the database exists and is selected before initializing tables.

db.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`, (err) => {
  if (err) {
    console.error("Failed to create database before initializing tables:", err);
    return;
  }

  db.query(`USE ${DB_NAME}`, (err) => {
    if (err) {
      console.error("Failed to select database before initializing tables:", err);
      return;
    }

    createTables();
  });
});
