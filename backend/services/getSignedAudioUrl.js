// backend/services/getSignedAudioUrl.js
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/storage.js";

// A signed URL allows temporary access to a private file in S3/R2. This function generates a signed URL for the given file key, valid for a specified duration (default 5 minutes).
export async function getSignedAudioUrl(fileKey, expiresIn = 300) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: fileKey,
  });
  return getSignedUrl(s3, command, { expiresIn });
}