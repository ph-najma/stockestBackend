import mongoose from "mongoose";
const videosessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  instructorId: { type: String, required: true },
  studentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const videoSession = mongoose.model("videoSession", videosessionSchema);
export default videoSession;
