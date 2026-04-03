const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sevensem_project',
});

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

const frontendDoctors = {
  Emergency: [
    { name: 'Dr. Ram Prasad Bhattarai', specialization: 'Emergency Medicine Specialist' },
    { name: 'Dr. Rohit Pandey', specialization: 'Emergency Physician' },
    { name: 'Dr. Priya Pokhrel', specialization: 'Trauma Surgeon' },
  ],
  Cardiology: [
    { name: 'Dr. Rima BK', specialization: 'Cardiologist' },
    { name: 'Dr. Meera Iyer', specialization: 'Cardiac Specialist' },
    { name: 'Dr. Anil Reddy', specialization: 'Interventional Cardiologist' },
  ],
  Neurology: [
    { name: 'Dr. Anjali Pokhrel', specialization: 'Neurologist' },
    { name: 'Dr. Govind Rana', specialization: 'Neuro Specialist' },
    { name: 'Dr. Nirmal Kumar', specialization: 'Neurosurgeon' },
  ],
  Orthopedics: [
    { name: 'Dr. Rajesh Gupta', specialization: 'Orthopedic Surgeon' },
    { name: 'Dr. Sanjana Das', specialization: 'Orthopedist' },
    { name: 'Dr. Santi Thapa', specialization: 'Sports Medicine Doctor' },
  ],
  Dermatology: [
    { name: 'Dr. Ramesh Shrestha', specialization: 'Dermatologist' },
    { name: 'Dr. Rahul Joshi', specialization: 'Skin Specialist' },
    { name: 'Dr. Priya Kapoor', specialization: 'Cosmetic Dermatologist' },
  ],
  Pediatrics: [
    { name: 'Dr. Rajeev Malik', specialization: 'Pediatrician' },
    { name: 'Dr. Kavya Sharma', specialization: 'Pediatric Specialist' },
    { name: 'Dr. Akshay Patel', specialization: 'Child Specialist' },
  ],
};

async function detectDepartmentNameColumn() {
  const rows = await query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'departments'
        AND COLUMN_NAME IN ('department_name', 'name')
    `
  );

  const names = rows.map((r) => r.COLUMN_NAME);
  if (names.includes('department_name')) return 'department_name';
  return 'name';
}

async function hasColumn(tableName, columnName) {
  const rows = await query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );
  return Number(rows?.[0]?.count || 0) > 0;
}

async function syncDoctors() {
  const deptNameColumn = await detectDepartmentNameColumn();

  const departments = await query(
    `SELECT department_id, ${deptNameColumn} AS department_name FROM departments`
  );

  const deptIdByName = new Map();
  departments.forEach((d) => {
    deptIdByName.set(String(d.department_name).trim().toLowerCase(), d.department_id);
  });

  const hasAvgConsult = await hasColumn('doctors', 'avg_consult_time');

  const keepPairs = [];
  for (const [deptName, doctors] of Object.entries(frontendDoctors)) {
    const deptId = deptIdByName.get(deptName.toLowerCase());
    if (!deptId) {
      throw new Error(`Department not found: ${deptName}`);
    }

    for (const doctor of doctors) {
      keepPairs.push({ name: doctor.name, deptId });

      const existing = await query(
        `SELECT doctor_id FROM doctors WHERE doctor_name = ? AND department_id = ? LIMIT 1`,
        [doctor.name, deptId]
      );

      if (existing.length === 0) {
        if (hasAvgConsult) {
          await query(
            `
              INSERT INTO doctors (doctor_name, department_id, specialization, avg_consult_time, status)
              VALUES (?, ?, ?, ?, 'available')
            `,
            [doctor.name, deptId, doctor.specialization, 10]
          );
        } else {
          await query(
            `
              INSERT INTO doctors (doctor_name, department_id, specialization, status)
              VALUES (?, ?, ?, 'available')
            `,
            [doctor.name, deptId, doctor.specialization]
          );
        }
      } else {
        await query(
          `
            UPDATE doctors
            SET specialization = COALESCE(NULLIF(specialization, ''), ?)
            WHERE doctor_name = ? AND department_id = ?
          `,
          [doctor.specialization, doctor.name, deptId]
        );
      }
    }
  }

  const keepConditions = keepPairs.map(() => '(doctor_name = ? AND department_id = ?)').join(' OR ');
  const keepValues = keepPairs.flatMap((p) => [p.name, p.deptId]);

  const toDelete = await query(
    `
      SELECT doctor_id, doctor_name, department_id
      FROM doctors
      WHERE NOT (${keepConditions})
    `,
    keepValues
  );

  if (toDelete.length > 0) {
    const deleteIds = toDelete.map((d) => d.doctor_id);
    await query(
      `DELETE FROM tokens WHERE doctor_id IN (${deleteIds.map(() => '?').join(',')})`,
      deleteIds
    );
    await query(
      `DELETE FROM doctors WHERE doctor_id IN (${deleteIds.map(() => '?').join(',')})`,
      deleteIds
    );
  }

  const final = await query(
    `
      SELECT d.doctor_id, d.doctor_name, dep.${deptNameColumn} AS department_name, d.specialization
      FROM doctors d
      JOIN departments dep ON dep.department_id = d.department_id
      ORDER BY dep.${deptNameColumn}, d.doctor_name
    `
  );

  console.log('Final doctor rows (frontend-aligned only):');
  final.forEach((r) => {
    console.log(`${r.doctor_id}\t${r.department_name}\t${r.doctor_name}\t${r.specialization || ''}`);
  });

  console.log(`\nTotal doctors kept: ${final.length}`);
}

syncDoctors()
  .then(() => {
    console.log('\nDoctor sync to frontend list complete.');
    connection.end();
  })
  .catch((err) => {
    console.error('Doctor sync failed:', err);
    connection.end();
    process.exit(1);
  });
