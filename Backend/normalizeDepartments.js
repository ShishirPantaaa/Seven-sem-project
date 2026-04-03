const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sevensem_project',
});

const allowedDepartments = [
  'Emergency',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
];

const descriptions = {
  Emergency: 'Immediate medical care',
  Cardiology: 'Heart and cardiovascular diseases',
  Neurology: 'Brain and nervous system disorders',
  Orthopedics: 'Bones, joints, and musculoskeletal system',
  Dermatology: 'Skin diseases and conditions',
  Pediatrics: 'Medical care for children',
};

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

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

async function ensureUniqueIndex(nameColumn) {
  try {
    await query(`ALTER TABLE departments ADD UNIQUE INDEX uniq_departments_name (${nameColumn})`);
    console.log('Added unique index on departments name column.');
  } catch (err) {
    if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_ENTRY') {
      console.log('Unique index already exists or duplicates were present before cleanup.');
      return;
    }
    throw err;
  }
}

async function normalize() {
  const nameColumn = await detectDepartmentNameColumn();
  console.log('Using department name column:', nameColumn);

  const departments = await query(`
    SELECT department_id, ${nameColumn} AS department_name, description
    FROM departments
    ORDER BY department_id ASC
  `);

  const byName = new Map();
  for (const row of departments) {
    const key = String(row.department_name || '').trim().toLowerCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(row);
  }

  const canonicalIdByName = new Map();

  for (const deptName of allowedDepartments) {
    const key = deptName.toLowerCase();
    const matches = byName.get(key) || [];

    if (matches.length > 0) {
      canonicalIdByName.set(deptName, matches[0].department_id);
    } else {
      const result = await query(
        `INSERT INTO departments (${nameColumn}, description) VALUES (?, ?)`,
        [deptName, descriptions[deptName] || null]
      );
      canonicalIdByName.set(deptName, result.insertId);
      console.log(`Inserted missing department: ${deptName}`);
    }
  }

  for (const deptName of allowedDepartments) {
    const key = deptName.toLowerCase();
    const matches = byName.get(key) || [];
    const canonicalId = canonicalIdByName.get(deptName);

    await query('UPDATE departments SET description = ? WHERE department_id = ?', [
      descriptions[deptName] || null,
      canonicalId,
    ]);

    const duplicateIds = matches
      .map((d) => d.department_id)
      .filter((id) => id !== canonicalId);

    if (duplicateIds.length > 0) {
      await query(
        `UPDATE doctors SET department_id = ? WHERE department_id IN (${duplicateIds.map(() => '?').join(',')})`,
        [canonicalId, ...duplicateIds]
      );

      await query(
        `DELETE FROM departments WHERE department_id IN (${duplicateIds.map(() => '?').join(',')})`,
        duplicateIds
      );

      console.log(`Merged duplicates for ${deptName}:`, duplicateIds);
    }
  }

  const keepIds = allowedDepartments.map((d) => canonicalIdByName.get(d));
  const emergencyId = canonicalIdByName.get('Emergency');

  await query(
    `UPDATE doctors SET department_id = ? WHERE department_id NOT IN (${keepIds.map(() => '?').join(',')})`,
    [emergencyId, ...keepIds]
  );

  await query(
    `DELETE FROM departments WHERE department_id NOT IN (${keepIds.map(() => '?').join(',')})`,
    keepIds
  );

  await ensureUniqueIndex(nameColumn);

  const finalDepartments = await query(
    `SELECT department_id, ${nameColumn} AS department_name, description FROM departments ORDER BY FIELD(${nameColumn}, 'Emergency','Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics')`
  );

  console.log('\nFinal departments:');
  finalDepartments.forEach((d) => {
    console.log(`${d.department_id}\t${d.department_name}\t${d.description || ''}`);
  });

  const doctorCounts = await query(
    `
      SELECT dep.${nameColumn} AS department_name, COUNT(*) AS doctor_count
      FROM doctors doc
      JOIN departments dep ON doc.department_id = dep.department_id
      GROUP BY dep.${nameColumn}
      ORDER BY dep.${nameColumn}
    `
  );

  console.log('\nDoctors by department:');
  doctorCounts.forEach((r) => {
    console.log(`${r.department_name}: ${r.doctor_count}`);
  });
}

normalize()
  .then(() => {
    console.log('\nDepartment normalization complete.');
    connection.end();
  })
  .catch((err) => {
    console.error('Normalization failed:', err);
    connection.end();
    process.exit(1);
  });
