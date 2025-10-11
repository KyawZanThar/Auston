/*
  End-to-end test script for Auston app.

  Usage:
    1) Make sure server is running: node server.js
    2) Install dependencies used by this script (once):
       npm install axios form-data
    3) Run the script:
       node tools/e2e_test.js <adminPassword> <studentPassword>

  Example:
    node tools/e2e_test.js Admin@123 Student@123

  What it does:
    - Ensures an admin user exists in users.json (creates one if missing) using the provided adminPassword
    - Registers a student using provided studentPassword
    - Logs in as student and uploads tools/sample.pdf
    - Logs in as admin and approves the uploaded book

  Notes:
    - This script assumes the server is running at http://localhost:3001
    - It writes to the project's users.json to create/update the admin user.
*/

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const bcrypt = require('bcryptjs');

const SERVER = 'http://localhost:3001';
const usersFile = path.join(__dirname, '../users.json');
const sampleFilePath = path.join(__dirname, 'sample.pdf');

async function ensureAdmin(adminPassword) {
  const admin = {
    username: 'Test Admin',
    email: 'admin@auston.edu.mm',
    austonId: 'AUADMIN',
    role: 'admin'
  };

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8') || '[]');
  } catch (err) {
    console.warn('users.json not found or invalid, creating a new one.');
  }

  const existing = users.find(u => u.email === admin.email || u.austonId === admin.austonId);
  if (existing) {
    console.log('Admin user already exists in users.json. Leaving it as-is.');
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  users.push({ ...admin, password: hashed });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log('Admin user added to users.json');
}

async function registerStudent(studentEmail, studentAustonId, studentPassword) {
  try {
    const res = await axios.post(`${SERVER}/api/user/register`, {
      username: 'E2E Student',
      email: studentEmail,
      austonId: studentAustonId,
      password: studentPassword
    });
    console.log('Student registered', res.status);
  } catch (err) {
    if (err.response) {
      console.warn('Register student failed:', err.response.data.message || err.response.statusText);
    } else {
      console.warn('Register student error:', err.message);
    }
  }
}

async function login(emailOrAustonId, password) {
  try {
    const body = emailOrAustonId.includes('@') ? { email: emailOrAustonId, password } : { austonId: emailOrAustonId, password };
    const res = await axios.post(`${SERVER}/api/user/login`, body);
    return res.data.token;
  } catch (err) {
    console.error('Login failed:', err.response ? err.response.data : err.message);
    throw err;
  }
}

async function uploadBook(token) {
  const form = new FormData();
  form.append('title', 'E2E Sample Book');
  form.append('author', 'E2E Script');
  form.append('description', 'Uploaded by e2e_test script');
  form.append('file', fs.createReadStream(sampleFilePath));

  try {
    const res = await axios.post(`${SERVER}/api/books/upload`, form, {
      headers: { Authorization: 'Bearer ' + token, ...form.getHeaders() }
    });
    console.log('Upload response:', res.status);
    return res.data.book; // should include _id
  } catch (err) {
    console.error('Upload failed:', err.response ? err.response.data : err.message);
    throw err;
  }
}

async function approveBook(adminToken, bookId) {
  try {
    const res = await axios.patch(`${SERVER}/api/books/approve/${bookId}`, null, {
      headers: { Authorization: 'Bearer ' + adminToken }
    });
    console.log('Approve response:', res.status, res.data.message);
    return res.data.book;
  } catch (err) {
    console.error('Approve failed:', err.response ? err.response.data : err.message);
    throw err;
  }
}

async function main() {
  const adminPassword = process.argv[2] || 'Admin@123';
  const studentPassword = process.argv[3] || 'Student@123';
  const studentEmail = 'student1@st.auston.edu.mm';
  const studentAustonId = 'AU_STUDENT_1';

  // Ensure sample file exists
  if (!fs.existsSync(sampleFilePath)) {
    console.error('Sample file not found at', sampleFilePath);
    console.error('Make sure tools/sample.pdf exists');
    process.exit(1);
  }

  await ensureAdmin(adminPassword);

  await registerStudent(studentEmail, studentAustonId, studentPassword);

  const studentToken = await login(studentEmail, studentPassword);
  console.log('Student token:', studentToken.slice(0, 40) + '...');

  const book = await uploadBook(studentToken);
  console.log('Uploaded book id:', book._id);

  const adminToken = await login('admin@auston.edu.mm', adminPassword);
  console.log('Admin token:', adminToken.slice(0, 40) + '...');

  await approveBook(adminToken, book._id);
  console.log('Book approved. You can verify via Admin UI or GET /api/books?status=approved');
}

main().catch(err => {
  console.error('E2E script failed', err);
  process.exit(1);
});
