import mongoose from "mongoose";

const connectDB = async () => {
    const primaryURI = process.env.MONGODB_URI;
    const localURI = "mongodb://127.0.0.1:27017/rail_tracker";

    try {
        console.log(`⏳ Connecting to Primary MongoDB Cluster...`);
        const conn = await mongoose.connect(primaryURI, {
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout
        });
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.warn(`⚠️ Primary MongoDB Connection Failed: ${error.message}`);
        console.log(`⏳ Attempting Local MongoDB Backup (${localURI})...`);
        
        try {
            const conn = await mongoose.connect(localURI, {
                serverSelectionTimeoutMS: 3000
            });
            console.log(`🚀 Local MongoDB Connected: ${conn.connection.host}`);
            return true;
        } catch (localError) {
            console.error("\n❌ MONGO CONNECTION FAILURE ERROR:");
            console.error("1. Primary MongoDB Atlas failed (likely IP whitelist or credentials issue).");
            console.error("2. Local MongoDB backup failed (make sure mongod is running locally).");
            console.error("\n👉 How to Fix:");
            console.error(" - Check Atlas: Go to https://cloud.mongodb.com, Network Access, and allow access from '0.0.0.0/0' or your current IP.");
            console.error(" - Check Local: Start mongod service on your machine: e.g. 'brew services start mongodb-community' on Mac.");
            console.error(" - Or: Update MONGODB_URI in backend/.env with a valid connection string.\n");
            
            // Exit in production, but let server run in dev so mock services still function
            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            } else {
                console.log("⚠️ Continuing in Development Mode without MongoDB database connectivity (offline mock fallbacks will be active).");
                return false;
            }
        }
    }
};

export default connectDB;
