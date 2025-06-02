

// async function main() {
//     await testLogin();
//     // await testC2C();
// }

// main().catch(console.log)


import express from 'express';
import authRoutes from './routes/auth.route';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGO_URI || "").then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
