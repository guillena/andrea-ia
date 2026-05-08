import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('storage.bucket');
    this.publicUrl = this.config.get<string>('storage.publicUrl');

    // Railway Buckets es S3-compatible
    this.s3 = new S3Client({
      endpoint: this.config.get<string>('storage.endpoint'),
      region: this.config.get<string>('storage.region') || 'auto',
      credentials: {
        accessKeyId: this.config.get<string>('storage.accessKey'),
        secretAccessKey: this.config.get<string>('storage.secretKey'),
      },
      forcePathStyle: true, // requerido para S3-compatible APIs
    });
  }

  // ── Upload de buffer ─────────────────────────────────────
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const key = `${folder}/${uuid()}-${filename}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    this.logger.debug(`Uploaded: ${key}`);
    const fullUrl = `${this.publicUrl}/${key}`;
    return this.getPresignedUrl(fullUrl, 86400 * 7); // 7 days expiration
  }

  // ── Upload de audio (webm/mp3) ───────────────────────────
  async uploadAudio(buffer: Buffer, sessionId: string, type: 'candidate' | 'agent' | 'full'): Promise<string> {
    return this.uploadBuffer(
      buffer,
      `audios/${sessionId}`,
      `${type}.webm`,
      'audio/webm',
    );
  }

  // ── Upload de MP3 (TTS output) ───────────────────────────
  async uploadAgentAudio(buffer: Buffer, sessionId: string, turnNumber: number): Promise<string> {
    return this.uploadBuffer(
      buffer,
      `audios/${sessionId}`,
      `agent-turn-${turnNumber}.mp3`,
      'audio/mpeg',
    );
  }

  // ── Upload de PDF ────────────────────────────────────────
  async uploadPdf(buffer: Buffer, candidateId: string): Promise<string> {
    return this.uploadBuffer(
      buffer,
      'reports',
      `report-${candidateId}.pdf`,
      'application/pdf',
    );
  }

  // ── URL presignada temporal ──────────────────────────────
  async getPresignedUrl(url: string, expiresInSeconds = 3600): Promise<string> {
    const key = url.replace(`${this.publicUrl}/`, '');
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  // ── Eliminar archivo ─────────────────────────────────────
  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    this.logger.debug(`Deleted: ${key}`);
  }
}
