require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDB() {
  try {
    const token = 'caabbe3cc49956cb5203bc6d736fcef14066cbe7f79ce55386ded983de353304';
    const candidate = await prisma.candidate.findUnique({
      where: { evalToken: token },
    });
    console.log("CANDIDATE:", candidate);
    if (!candidate) {
      console.log("NO CANDIDATE FOUND");
      return;
    }
    
    const consent = await prisma.consent.findUnique({
      where: { candidateId: candidate.id },
    });
    console.log("CONSENT:", consent);

    const campaign = await prisma.evaluationCampaign.findUnique({
      where: { id: candidate.campaignId },
      include: {
        jobPosition: { select: { name: true } },
        company: { select: { name: true } },
      },
    });
    console.log("CAMPAIGN:", campaign);
  } catch(e) {
    console.error("DB ERROR:", e.message);
  }
}

testDB();
