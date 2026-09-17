import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_ENDPOINT: string = process.env.S3_ENDPOINT!;
const S3_REGION: string = process.env.S3_REGION!;
const S3_BUCKET: string = process.env.S3_BUCKET!;
const S3_ACCESS_KEY_ID: string = process.env.S3_ACCESS_KEY_ID!;
const S3_SECRET_ACCESS_KEY: string = process.env.S3_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
})

export async function createPresignedUrl(key: string, contentType: string, expiresInSeconds: number,): Promise<string> {

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
