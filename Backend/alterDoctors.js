const db = require('./config/database');

const alterTable = () => {
  const alterQuery = 'ALTER TABLE doctors ADD COLUMN department VARCHAR(255);';

  db.query(alterQuery, (err, result) => {
    if (err) {
      console.log('Error altering doctors table:', err);
    } else {
      console.log('Department column added successfully');
    }
  });
};

alterTable();