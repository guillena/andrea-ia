require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

const prisma = new PrismaClient();

const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true,
});

async function simulateStartSession() {
  try {
    const token = 'caabbe3cc49956cb5203bc6d736fcef14066cbe7f79ce55386ded983de353304';
    const candidate = await prisma.candidate.findUnique({ where: { evalToken: token } });
    let session = await prisma.evaluationSession.findUnique({ where: { candidateId: candidate.id } });
    if (!session) {
      session = await prisma.evaluationSession.create({
        data: { candidateId: candidate.id, status: 'in_progress', startedAt: new Date() },
      });
    }

    const campaign = await prisma.evaluationCampaign.findUnique({
      where: { id: candidate.campaignId },
      include: { jobPosition: { select: { name: true } }, company: { select: { name: true } } },
    });

    const introText = "Hola";
    
    console.log("Synthesizing...");
    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY, process.env.AZURE_SPEECH_REGION);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    const introAudioBuffer = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(introText, (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) resolve(Buffer.from(result.audioData));
        else reject(new Error(result.errorDetails));
      }, reject);
    });

    console.log("Uploading...");
    const key = `audios/${session.id}/agent-turn-0.mp3`;
    await s3.send(new PutObjectCommand({ Bucket: process.env.STORAGE_BUCKET_NAME, Key: key, Body: introAudioBuffer, ContentType: 'audio/mpeg' }));
    
    const command = new GetObjectCommand({ Bucket: process.env.STORAGE_BUCKET_NAME, Key: key });
    const introAudioUrl = await getSignedUrl(s3, command, { expiresIn: 86400 * 7 });
    console.log("URL Length:", introAudioUrl.length);

    console.log("Saving turn...");
    await prisma.conversationTurn.create({
      data: {
        sessionId: session.id,
        turnNumber: 0,
        speaker: 'agent',
        contentText: introText,
        audioUrl: introAudioUrl,
      },
    });

    console.log("SUCCESS");
  } catch(e) {
    console.error("SIMULATION ERROR:", e.message);
  }
}

simulateStartSession();
