const axios = require('axios');

async function testBookToken() {
  try {
    const response = await axios.post('http://localhost:5000/api/opd/book-token', {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      gender: 'Male',
      address: '123 Main St',
      department: 'Cardiology',
      doctor: 'Dr. Rima BK'
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testBookToken();