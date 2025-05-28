const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// PUJAR FITXER
async function uploadBufferToS3(fileBuffer, fileName, mimeType) {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);
  console.log("File uploaded successfully");

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

// OBTINDRE LA "KEY" A PARTIR DE LA URL
function getKeyFromS3Url(s3Url) {
  const url = new URL(s3Url);
  return decodeURIComponent(url.pathname.slice(1));
}

// BORRAR FITXER A PARTIR DE LA URL
async function deleteFileFromS3Url(s3Url) {
  const key = getKeyFromS3Url(s3Url);

  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const command = new DeleteObjectCommand(deleteParams);
  await s3.send(command);

  console.log(`Fitxer "${key}" eliminat correctament de S3 .`);
}

module.exports = {
  s3,
  GetObjectCommand,
  uploadBufferToS3,
  deleteFileFromS3Url,
  getKeyFromS3Url,
};
