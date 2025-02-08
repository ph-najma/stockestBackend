import videoSession from "../models/videocall";

export class videosessionRepository {
  public async createSession(InstructorId: string): Promise<any> {
    const sessionId = Math.random().toString(36).substring(2, 10);
    const newSession = new videoSession({
      sessionId,
      instructorId: InstructorId,
    });
    console.log(newSession);
    await newSession.save();
    console.log(sessionId);
    return sessionId;
  }
  public async joinSession(student: string, sessionId: string): Promise<any> {
    const session = await videoSession.findOne({ sessionId });
    if (!session) {
      return "session not found";
    }
    session.studentId = student;
    await session.save();
    return "joined session";
  }
}
