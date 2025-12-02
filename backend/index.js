import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
    
app.listen(PORT, () => {
   connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
