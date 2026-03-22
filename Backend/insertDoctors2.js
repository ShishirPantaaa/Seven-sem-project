const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Shishir@2003"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully for insert");

    db.query("USE sevensem_project", (err) => {
      if (err) {
        console.log("Error selecting database:", err);
      } else {
        console.log("Database selected");

        const doctors = [
          "Dr. Ram Prasad Bhattarai",
          "Dr. Rohit Pandey",
          "Dr. Priya Pokhrel",
          "Dr. Anjali Pokhrel",
          "Dr. Govind Rana",
          "Dr. Nirmal Kumar",
          "Dr. Rajesh Gupta",
          "Dr. Sanjana Das",
          "Dr. Santi Thapa",
          "Dr. Rima BK",
          "Dr. Meera Iyer",
          "Dr. Anil Reddy",
          "Dr. Ramesh Shrestha",
          "Dr. Rahul Joshi",
          "Dr. Priya Kapoor",
          "Dr. Rajeev Malik",
          "Dr. Kavya Sharma",
          "Dr. Akshay Patel",
        ];

        const insertDoctors = () => {
          const query = 'INSERT INTO doctors (doctor_name) VALUES ? ON DUPLICATE KEY UPDATE doctor_name=doctor_name';
          const values = doctors.map(name => [name]);

          db.query(query, [values], (err, result) => {
            if (err) {
              console.log('Error inserting doctors:', err);
            } else {
              console.log('Doctors inserted successfully');
            }
            db.end();
          });
        };

        insertDoctors();
      }
    });
  }
});