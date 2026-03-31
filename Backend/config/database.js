require('dotenv').config();
const mysql = require("mysql2");

const DB_NAME = process.env.DB_NAME || "sevensem_project";

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Shishir@2003",
  multipleStatements: false, // safer
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully");
    // Create database if not exists
    db.query("CREATE DATABASE IF NOT EXISTS sevensem_project", (err) => {
      if (err) {
        console.log("Error creating database:", err);
      } else {
        console.log("Database sevensem_project ready");
        // Switch to the database
        db.changeUser({ database: "sevensem_project" }, (err) => {
          if (err) {
            console.log("Error switching to database:", err);
          } else {
            console.log("Switched to sevensem_project database");
          }
        });
      }
    });
  }
});

module.exports = db;