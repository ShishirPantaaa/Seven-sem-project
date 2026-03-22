const db = require('./config/database');

console.log('Running insertDoctors without department');

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
  const query = 'INSERT INTO doctors (doctor_name) VALUES ?';
  const values = doctors.map(name => [name]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.log('Error inserting doctors:', err);
    } else {
      console.log('Doctors inserted successfully');
    }
  });
};

insertDoctors();