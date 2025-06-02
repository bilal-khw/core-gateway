//get var from env file
import { config } from 'dotenv';
config();

export default {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET,
    URI : process.env.EXT_URL || ""
}