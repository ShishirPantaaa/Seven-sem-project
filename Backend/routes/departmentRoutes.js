const express = require("express");
const router = express.Router();
const db = require("../config/database");


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
router.get("/", (req, res) => {

  const sql = "SELECT department_id, department_name as name, description FROM departments";

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);

  });

});

// GET DOCTORS BY DEPARTMENT
router.get("/:departmentId/doctors", (req, res) => {

  const departmentId = req.params.departmentId;

  const sql = `
    SELECT * FROM doctors
    WHERE department_id = ?
  `;

  db.query(sql, [departmentId], (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);

  });

});

module.exports = router;