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

function scoreDoctor(row) {
  let score = 0;
  if (row.specialization && String(row.specialization).trim()) score += 5;
  if (row.qualifications && String(row.qualifications).trim()) score += 3;
  if (row.photo_url && String(row.photo_url).trim()) score += 3;
  if (row.contact_no && String(row.contact_no).trim()) score += 3;
  if (row.avg_consult_time !== null && row.avg_consult_time !== undefined) score += 1;
  return score;
}

function pickKeeper(rows) {
  return rows
    .slice()
    .sort((a, b) => {
      const scoreDiff = scoreDoctor(b) - scoreDoctor(a);
      if (scoreDiff !== 0) return scoreDiff;
      return a.doctor_id - b.doctor_id;
    })[0];
}

async function normalizeDoctors() {
  const doctors = await query(`
    SELECT doctor_id, doctor_name, department_id, specialization, qualifications, photo_url, contact_no,
           avg_consult_time, status, created_at
    FROM doctors
    ORDER BY department_id, doctor_name, doctor_id
  `);

  const groups = new Map();
  for (const row of doctors) {
    const key = `${row.department_id}::${String(row.doctor_name || '').trim().toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  let mergedGroups = 0;
  let deletedCount = 0;

  for (const rows of groups.values()) {
    if (rows.length <= 1) continue;

    const keeper = pickKeeper(rows);
    const duplicateIds = rows.map((r) => r.doctor_id).filter((id) => id !== keeper.doctor_id);

    // Merge useful missing data from duplicates into keeper
    for (const row of rows) {
      if (row.doctor_id === keeper.doctor_id) continue;

      const merged = {
        specialization: keeper.specialization || row.specialization || null,
        qualifications: keeper.qualifications || row.qualifications || null,
        photo_url: keeper.photo_url || row.photo_url || null,
        contact_no: keeper.contact_no || row.contact_no || null,
      };

      await query(
        `UPDATE doctors
         SET specialization = ?, qualifications = ?, photo_url = ?, contact_no = ?
         WHERE doctor_id = ?`,
        [
          merged.specialization,
          merged.qualifications,
          merged.photo_url,
          merged.contact_no,
          keeper.doctor_id,
        ]
      );
    }

    if (duplicateIds.length > 0) {
      await query(
        `UPDATE tokens SET doctor_id = ? WHERE doctor_id IN (${duplicateIds.map(() => '?').join(',')})`,
        [keeper.doctor_id, ...duplicateIds]
      );

      await query(
        `DELETE FROM doctors WHERE doctor_id IN (${duplicateIds.map(() => '?').join(',')})`,
        duplicateIds
      );

      mergedGroups += 1;
      deletedCount += duplicateIds.length;
      console.log(`Merged doctor duplicates for ${keeper.doctor_name} (dept ${keeper.department_id}): removed`, duplicateIds);
    }
  }

  const summary = await query(`
    SELECT dep.department_name, COUNT(*) AS doctor_count
    FROM doctors d
    JOIN departments dep ON dep.department_id = d.department_id
    GROUP BY dep.department_name
    ORDER BY dep.department_name
  `);

  console.log('\nDoctor normalization summary:');
  console.log('Merged groups:', mergedGroups);
  console.log('Deleted duplicate rows:', deletedCount);
  summary.forEach((row) => {
    console.log(`${row.department_name}: ${row.doctor_count}`);
  });
}

normalizeDoctors()
  .then(() => {
    console.log('\nDoctor normalization complete.');
    connection.end();
  })
  .catch((err) => {
    console.error('Doctor normalization failed:', err);
    connection.end();
    process.exit(1);
  });
