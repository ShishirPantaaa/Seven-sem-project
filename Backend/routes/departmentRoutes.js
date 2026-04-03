const express = require("express");
const router = express.Router();
const db = require("../config/database");
const util = require("util");

const query = util.promisify(db.query).bind(db);

const resolveDepartmentNameColumn = async () => {
  const columns = await query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'departments'
        AND COLUMN_NAME IN ('department_name', 'name')
    `
  );

  const columnNames = columns.map((col) => col.COLUMN_NAME);
  if (columnNames.includes('department_name')) return 'department_name';
  return 'name';
};


// CREATE DEPARTMENT
router.post("/create", (req, res) => {

  const { name, description } = req.body;

  const sql = "INSERT INTO departments (department_name, description) VALUES (?, ?)";

  db.query(sql, [name, description], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Department created successfully",
      departmentId: result.insertId
    });

  });

});

// GET ALL DEPARTMENTS
router.get("/", async (req, res) => {
  try {
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const departments = await query(
      `SELECT department_id, ${departmentNameColumn} as name, description FROM departments ORDER BY ${departmentNameColumn}`
    );
    res.json(departments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET LIVE DEPARTMENTS WITH DOCTOR AVAILABILITY
router.get("/live", async (req, res) => {
  try {
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const rows = await query(
      `
        SELECT
          dept.department_id,
          dept.${departmentNameColumn} AS department_name,
          dept.description,
          d.doctor_id,
          d.doctor_name,
          d.specialization,
          d.qualifications,
          d.photo_url,
          d.contact_no,
          d.status
        FROM departments dept
        LEFT JOIN doctors d ON d.department_id = dept.department_id
        ORDER BY dept.${departmentNameColumn} ASC, d.doctor_name ASC
      `
    );

    const grouped = [];
    const byDepartmentId = new Map();

    for (const row of rows) {
      if (!byDepartmentId.has(row.department_id)) {
        const department = {
          department_id: row.department_id,
          department_name: row.department_name,
          description: row.description,
          total_doctors: 0,
          available_doctors: 0,
          unavailable_doctors: 0,
          doctors: []
        };
        byDepartmentId.set(row.department_id, department);
        grouped.push(department);
      }

      if (row.doctor_id) {
        const dept = byDepartmentId.get(row.department_id);
        dept.total_doctors += 1;

        if (row.status === 'available') {
          dept.available_doctors += 1;
        } else {
          dept.unavailable_doctors += 1;
        }

        dept.doctors.push({
          doctor_id: row.doctor_id,
          doctor_name: row.doctor_name,
          specialization: row.specialization,
          qualifications: row.qualifications,
          photo_url: row.photo_url,
          contact_no: row.contact_no,
          status: row.status
        });
      }
    }

    res.json(grouped);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET DOCTORS BY DEPARTMENT
router.get("/:departmentId/doctors", (req, res) => {
  const departmentId = req.params.departmentId;
  const statusFilter = req.query.status || "available";

  const allowedStatuses = ["available", "unavailable", "all"];
  if (!allowedStatuses.includes(statusFilter)) {
    return res.status(400).json({ error: "Invalid status filter" });
  }

  const shouldFilterByStatus = statusFilter !== "all";

  const sql = `
    SELECT * FROM doctors
    WHERE department_id = ?
    ${shouldFilterByStatus ? "AND status = ?" : ""}
  `;

  const params = shouldFilterByStatus ? [departmentId, statusFilter] : [departmentId];

  db.query(sql, params, (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);

  });

});

module.exports = router;