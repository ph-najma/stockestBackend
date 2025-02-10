import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // For generating signed URLs
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

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
  async generateUploadURL(): Promise<{ uploadURL: string; key: string }> {
    const key = `my-user-profile-photos/${uuidv4()}.jpg`; // Unique file name
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: "image/*",
    });

    try {
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      return { uploadURL: url, key };
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
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return signedUrl;
    } catch (error) {
      console.error("Error generating download URL:", error);
      throw error;
    }
  }
}
