import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/glamour_pdf";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("💾 Connected to MongoDB successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Schemas & Models
const DocumentSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    pages: { type: Number, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const DocumentChunkSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDocument', required: true },
    chunkText: { type: String, required: true }
});

export const UserDocument = mongoose.models.UserDocument || mongoose.model('UserDocument', DocumentSchema);
export const DocumentChunk = mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', DocumentChunkSchema);
