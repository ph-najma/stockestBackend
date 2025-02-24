import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // For generating signed URLs
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import User from "./models/userModel";

dotenv.config();

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class S3Service {
  private bucketName = process.env.S3_BUCKET_NAME!;

  // Generate a Signed Upload URL (PUT)
  async generateUploadURL(
    userId: string
  ): Promise<{ url: string; Key: string }> {
    const Key = `my-user-profile-photos/${uuidv4()}.jpg`; // Unique file name
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: Key,
      ContentType: "image/jpeg",
    });

    try {
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      const user = await User.findByIdAndUpdate(
        userId,
        { profilePhoto: Key },
        { new: true }
      );
      return { url, Key };
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
  }

  // Generate a Signed Download URL (GET)
  async generateDownloadURL(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      return url;
    } catch (error) {
      console.error("Error generating download URL:", error);
      throw error;
    }
  }
}
