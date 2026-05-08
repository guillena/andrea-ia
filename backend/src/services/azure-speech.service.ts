import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { Readable, Writable } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class AzureSpeechService {
  private readonly logger = new Logger(AzureSpeechService.name);
  private readonly speechConfig: sdk.SpeechConfig;

  constructor(private config: ConfigService) {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      this.config.get<string>('azure.speech.key'),
      this.config.get<string>('azure.speech.region'),
    );
    this.speechConfig.speechRecognitionLanguage = this.config.get<string>('azure.speech.sttLanguage');
    this.speechConfig.speechSynthesisVoiceName = this.config.get<string>('azure.speech.ttsVoice');
    this.speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  }

  // ── STT: Audio Buffer → Transcripción ─────────────────────
  async transcribeBuffer(audioBuffer: Buffer, mimeType = 'audio/webm'): Promise<{
    text: string;
    confidence: number;
  }> {
    // Convertir de WebM a WAV 16kHz PCM para Azure
    let wavBuffer: Buffer;
    try {
      wavBuffer = await this.convertWebmToWav(audioBuffer);
    } catch (err) {
      this.logger.error('Error al convertir audio WebM a WAV', err);
      wavBuffer = audioBuffer; // Fallback (probablemente falle en Azure)
    }

    return new Promise((resolve, reject) => {
      const pushStream = sdk.AudioInputStream.createPushStream(
        sdk.AudioStreamFormat.getDefaultInputFormat(),
      );
      pushStream.write(wavBuffer.buffer.slice(wavBuffer.byteOffset, wavBuffer.byteOffset + wavBuffer.byteLength) as ArrayBuffer);
      pushStream.close();

      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
      const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(
        (result) => {
          recognizer.close();
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve({
              text: result.text,
              confidence: result.properties?.getProperty(
                sdk.PropertyId.SpeechServiceResponse_JsonResult,
                '{}',
              )
                ? 0.9
                : 0.7,
            });
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            resolve({ text: '', confidence: 0 });
          } else {
            reject(new Error(`STT Error: ${sdk.ResultReason[result.reason]}`));
          }
        },
        (err) => {
          recognizer.close();
          reject(err);
        },
      );
    });
  }

  private async convertWebmToWav(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const inputStream = new Readable();
      inputStream.push(buffer);
      inputStream.push(null);

      const chunks: Buffer[] = [];
      const outputStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(Buffer.from(chunk));
          callback();
        }
      });

      ffmpeg(inputStream)
        .outputFormat('wav')
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', (err) => reject(err))
        .pipe(outputStream);
    });
  }

  // ── TTS: Texto → Audio MP3 Buffer ─────────────────────────
  async synthesizeSpeech(text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

      synthesizer.speakTextAsync(
        text,
        (result) => {
          synthesizer.close();
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData));
          } else {
            reject(new Error(`TTS Error: ${result.errorDetails}`));
          }
        },
        (err) => {
          synthesizer.close();
          reject(err);
        },
      );
    });
  }

  // ── TTS con SSML (más control sobre voz) ──────────────────
  async synthesizeSsml(ssml: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData));
          } else {
            reject(new Error(`TTS SSML Error: ${result.errorDetails}`));
          }
        },
        (err) => {
          synthesizer.close();
          reject(err);
        },
      );
    });
  }

  /** Genera SSML con pausa natural entre párrafos */
  buildSsml(text: string, voice?: string): string {
    const v = voice || this.config.get<string>('azure.speech.ttsVoice');
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
      <voice name="${v}">
        <prosody rate="0.95" pitch="+2%">
          ${text}
        </prosody>
      </voice>
    </speak>`;
  }
}
