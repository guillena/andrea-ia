const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testS3() {
  try {
    const s3 = new S3Client({
      endpoint: 'https://your-bucket.up.railway.app',
      region: 'auto',
      credentials: {
        accessKeyId: 'your_railway_bucket_access_key',
        secretAccessKey: 'your_railway_bucket_secret_key',
      },
      forcePathStyle: true,
    });
    
    await s3.send(
      new PutObjectCommand({
        Bucket: 'andrea-files',
        Key: 'test.txt',
        Body: Buffer.from('hello'),
        ContentType: 'text/plain',
      }),
    );
    console.log("S3 works");
  } catch(e) {
    console.error("S3 Error:", e.message);
  }
}
testS3();
