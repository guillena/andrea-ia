require('dotenv').config();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function testS3Url() {
  try {
    const s3 = new S3Client({
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    const command = new GetObjectCommand({ Bucket: process.env.STORAGE_BUCKET_NAME, Key: 'test.txt' });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("URL:", url);
  } catch(e) {
    console.error("URL ERROR:", e.message);
  }
}

testS3Url();
