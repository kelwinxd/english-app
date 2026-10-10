import 'dotenv/config';

// Stub da Fase 0. A fila de áudio (STT → LLM → TTS) entra na Fase 5:
// aqui vamos instanciar um Worker do BullMQ ligado ao Redis para processar
// a fila 'audio'. Por enquanto só prova que o serviço sobe no Railway.
//
// Fase 5 (esboço):
//   import { Worker } from 'bullmq';
//   import IORedis from 'ioredis';
//   const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
//   new Worker('audio', async (job) => { /* whisper -> gpt -> elevenlabs -> r2 */ }, { connection });

console.log('[worker] boot ok — stub. Fila de áudio chega na Fase 5.');

// Mantém o processo vivo (no Railway o container não deve encerrar).
setInterval(() => {
  // heartbeat silencioso
}, 60_000);
