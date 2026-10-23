import { useEffect, useRef, useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { sendMessageStream, sendMessageTextStream } from '@/features/chat/api/chatApi';
import type { ChatStreamEvent, Correction, Entry, Stage } from '@/features/chat/types';
import type { Scenario } from './data';

const TURN_MS = 20_000; // 20s para o jogador responder

export function useScenario(scenario: Scenario) {
  const [conversationId] = useState(() => crypto.randomUUID());
  const [entries, setEntries] = useState<Entry[]>(() => [
    { role: 'ai', text: scenario.openingLine, audio: '' },
  ]);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(TURN_MS);

  const recorder = useRecorder();
  const tickRef = useRef<number | null>(null);

  function clearTick() {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTurnTimer() {
    clearTick();
    const deadline = Date.now() + TURN_MS;
    setRemaining(TURN_MS);
    tickRef.current = window.setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        setRemaining(0);
        clearTick(); // prática: não encerra, só para a contagem
      } else {
        setRemaining(left);
      }
    }, 100);
  }

  useEffect(() => {
    startTurnTimer();
    return () => clearTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fillLastUserCorrections(corrections: Correction[]) {
    setEntries((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        const item = next[i];
        if (item.role === 'user') {
          next[i] = { ...item, corrections };
          break;
        }
      }
      return next;
    });
  }

  function fillLastAiAudio(audio: string) {
    setEntries((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        const item = next[i];
        if (item.role === 'ai') {
          next[i] = { ...item, audio };
          break;
        }
      }
      return next;
    });
  }

  function handleEvent(evt: ChatStreamEvent) {
    switch (evt.type) {
      case 'user':
        setEntries((prev) => [...prev, { role: 'user', text: evt.userText, corrections: [] }]);
        setStage('thinking');
        break;
      case 'reply':
        fillLastUserCorrections(evt.corrections);
        setEntries((prev) => [...prev, { role: 'ai', text: evt.replyText, audio: '' }]);
        setStage('tts');
        break;
      case 'reply_audio':
        fillLastAiAudio(evt.replyAudio);
        new Audio(evt.replyAudio).play().catch(() => {});
        setStage('idle');
        break;
      case 'error':
        setError(evt.error);
        break;
      case 'turns':
        break;
    }
  }

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    clearTick();
    setError(null);
    setStage('thinking');
    try {
      await sendMessageTextStream(
        { text: trimmed, conversationId, characterId: scenario.characterId, correctGrammar: true },
        handleEvent,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar a mensagem.');
    } finally {
      setStage('idle');
      startTurnTimer();
    }
  }

  async function stopAndSend() {
    const blob = await recorder.stop();
    clearTick();
    setError(null);
    setStage('stt');
    try {
      await sendMessageStream(
        { audio: blob, conversationId, characterId: scenario.characterId, correctGrammar: true },
        handleEvent,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar o áudio.');
    } finally {
      setStage('idle');
      startTurnTimer();
    }
  }

  return {
    entries,
    stage,
    error,
    busy: stage !== 'idle',
    secondsLeft: Math.ceil(remaining / 1000),
    timePct: Math.max(0, Math.min(100, (remaining / TURN_MS) * 100)),
    isRecording: recorder.state === 'recording',
    recordSeconds: recorder.seconds,
    recorderError: recorder.error,
    startRecording: recorder.start,
    stopAndSend,
    cancelRecording: recorder.cancel,
    sendText,
  };
}
