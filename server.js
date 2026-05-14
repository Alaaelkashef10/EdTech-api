require('dotenv').config();

const app       = require('./src/app');
const connectDB = require('./src/config/db');

// Default port 3000 (frontend config.js targets :3000 in dev)
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running → http://localhost:${PORT}`);
  });
});