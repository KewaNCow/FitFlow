const bcrypt = require('bcryptjs');

// Hash from SQL file
const hashFromSQL = '$2a$10$WFh/4NDxbZy8.2IxIOjc/uaqtbYThDJ6twMjRRHkhNPNQ1gkdMBgu';

// Test passwords
const testPasswords = ['demo123', 'admin123'];

console.log('Testing password hashes...\n');

testPasswords.forEach(async (password) => {
  const isMatch = await bcrypt.compare(password, hashFromSQL);
  console.log(`Password: "${password}" - Match: ${isMatch}`);
  
  // Generate correct hash
  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(password, salt);
  console.log(`Correct hash for "${password}": ${newHash}\n`);
});
