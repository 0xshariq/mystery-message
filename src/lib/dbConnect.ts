import mongoose from 'mongoose';

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    try {
        if (connection.isConnected) {
            return;
        }
    
        const db = await mongoose.connect(process.env.MONGODB_URI || '');

        console.log(db);
        console.log(db.connections)
    
        connection.isConnected = db.connections[0].readyState;
        console.log('Connected to DB');
    } catch (error) {
        console.log('Error connecting to DB', error);
        process.exit(1);
    }
}

export default dbConnect;