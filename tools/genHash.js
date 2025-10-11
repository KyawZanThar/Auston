const bcrypt = require('bcryptjs');
const pass = process.argv[2] || 'adminpass';
bcrypt.hash(pass, 10, (err, hash) => {
  if (err) return console.error(err);
  console.log(hash);
});
