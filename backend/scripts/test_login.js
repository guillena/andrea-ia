const axios = require('axios');

async function main() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'maria@maria.com',
      password: 'Temp1234!'
    });
    console.log('Login successful:', res.data.user);
  } catch (err) {
    console.error('Login failed:', err.response?.status, err.response?.data);
  }
}

main();
