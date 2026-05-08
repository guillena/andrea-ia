require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

async function testAzure() {
  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    const text = "Hola";
    await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(text, (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
        } else {
          reject(new Error(`TTS Error: ${result.errorDetails}`));
        }
      }, (err) => {
        synthesizer.close();
        reject(err);
      });
    });
    console.log("Azure Speech OK");
  } catch(e) {
    console.error("AZURE ERROR:", e.message);
  }
}

async function testS3() {
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
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET_NAME,
        Key: 'test.txt',
        Body: Buffer.from('hello'),
        ContentType: 'text/plain',
      })
    );
    console.log("S3 OK");
  } catch(e) {
    console.error("S3 ERROR:", e.message);
  }
}

async function main() {
  await testAzure();
  await testS3();
}
main();
