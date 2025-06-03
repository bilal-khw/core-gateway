

// async function main() {
//     await testLogin();
//     // await testC2C();
// }

// main().catch(console.log)


import express from 'express';
import authRoutes from './routes/auth.route';
import transactionRoutes from './routes/transaction.route';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rule from './models/rulesModel';

dotenv.config();
const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGO_URI || "").then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});
// rule.insertMany([
//   {
//     type: "vendor_tier_bonus",
//     rules: {
//       Platinum: 10,
//       Gold: 7,
//       Silver: 5,
//       Bronze: 2
//     }
//   },
//   {
//     type: "time_based_points",
//     rules: {
//       "0-15": 5,
//       "15-30": 7,
//       "30-45": 10,
//       "45+": 12
//     }
//   },
//   {
//     type: "special_bonuses",
//     rules: {
//       general_bonus: 12
//     }
//   },
//   {
//     type: "starvation_guard",
//     rules: {
//       "0_min": 0,
//       "30_min": 10,
//       "60_min": 15
//     }
//   },
//   {
//     type: "combine_points",
//     rules: {
//       "1_piece": 15,
//       "2_pieces": 10,
//       "3_pieces": 7,
//       "4_pieces": 5
//     }
//   },
//   {
//     type: "child_withdrawal_bonus",
//     rules: {
//       "1_piece": 18,
//       "2_pieces": 12,
//       "3_pieces": 6
//     }
//   }
// ]);

app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
