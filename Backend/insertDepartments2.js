const mysql = require("mysql2");
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Shishir@2003",
  database: process.env.DB_NAME || "sevensem_project"
});

const departments = [
  { name: 'Cardiology', description: 'Heart and cardiovascular diseases' },
  { name: 'Neurology', description: 'Brain and nervous system disorders' },
  { name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal system' },
  { name: 'Dermatology', description: 'Skin diseases and conditions' },
  { name: 'Pediatrics', description: 'Medical care for children' },
  { name: 'Gynecology', description: 'Women\'s reproductive health' }
];

const insertDepartments = () => {
  const query = 'INSERT INTO departments (department_name, description) VALUES ? ON DUPLICATE KEY UPDATE department_name=department_name';
  const values = departments.map(dept => [dept.name, dept.description]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.log('Error inserting departments:', err);
    } else {
      console.log('Departments inserted successfully');
      // Now assign doctors to departments
      assignDoctorsToDepartments();
    }
  });
};

const assignDoctorsToDepartments = () => {
  // Get department IDs
  db.query('SELECT department_id, department_name FROM departments', (err, deptResults) => {
    if (err) {
      console.log('Error fetching departments:', err);
      return;
    }

    const deptMap = {};
    deptResults.forEach(dept => {
      deptMap[dept.department_name] = dept.department_id;
    });

    // Sample doctor assignments
    const doctorAssignments = [
      { name: 'Dr. Ram Prasad Bhattarai', department: 'Emergency' },
      { name: 'Dr. Rohit Pandey', department: 'Emergency' },
      { name: 'Dr. Priya Pokhrel', department: 'Emergency' },
      { name: 'Dr. Anjali Pokhrel', department: 'Neurology' },
      { name: 'Dr. Govind Rana', department: 'Neurology' },
      { name: 'Dr. Nirmal Kumar', department: 'Neurology' },
      { name: 'Dr. Rajesh Gupta', department: 'Orthopedics' },
      { name: 'Dr. Sanjana Das', department: 'Orthopedics' },
      { name: 'Dr. Santi Thapa', department: 'Orthopedics' },
      { name: 'Dr. Rima BK', department: 'Cardiology' },
      { name: 'Dr. Meera Iyer', department: 'Cardiology' },
      { name: 'Dr. Anil Reddy', department: 'Cardiology' },
      { name: 'Dr. Ramesh Shrestha', department: 'Dermatology' },
      { name: 'Dr. Rahul Joshi', department: 'Dermatology' },
      { name: 'Dr. Priya Kapoor', department: 'Dermatology' },
      { name: 'Dr. Rajeev Malik', department: 'Pediatrics' },
      { name: 'Dr. Kavya Sharma', department: 'Pediatrics' },
      { name: 'Dr. Akshay Patel', department: 'Pediatrics' }
    ];

    // Update doctors with department_id
    doctorAssignments.forEach(doctor => {
      const deptId = deptMap[doctor.department];
      if (deptId) {
        db.query(
          'UPDATE doctors SET department_id = ? WHERE doctor_name = ?',
          [deptId, doctor.name],
          (err) => {
            if (err) {
              console.log(`Error updating doctor ${doctor.name}:`, err);
            }
          }
        );
      }
    });

    console.log('Doctor assignments completed');
    db.end();
  });
};

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
    return;
  }
  console.log("MySQL Connected Successfully for departments insert");

  insertDepartments();
});