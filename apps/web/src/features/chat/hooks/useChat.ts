import { useEffect, useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { fetchCharacters, sendMessageStream, sendMessageTextStream } from '../api/chatApi';
import type { Character, ChatStreamEvent, CharactersResponse, Correction, Entry, Stage } from '../types';

const GRAMMAR_KEY = 'englishapp:correctGrammar';

function readGrammarPref(): boolean {
  try {
    return localStorage.getItem(GRAMMAR_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * Orquestra toda a feature de conversa: carrega personagens, grava áudio,
 * envia para a API e renderiza a resposta em etapas (streaming). A page só
 * desestrutura o que precisa.
 */
export function useChat() {
  const [meta, setMeta] = useState<CharactersResponse | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [conversationId] = useState(() => crypto.randomUUID());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<{ used: number; max: number } | null>(null);
  const [correctGrammar, setCorrectGrammar] = useState<boolean>(readGrammarPref);

  const recorder = useRecorder();

  useEffect(() => {
    fetchCharacters()
      .then(setMeta)
      .catch(() => setMetaError('Não consegui carregar os personagens (a API está no ar?).'));
  }, []);

  function toggleGrammar() {
    setCorrectGrammar((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(GRAMMAR_KEY, String(next));
      } catch {
        /* ignora: localStorage pode estar indisponível */
      }
      return next;
    });
  }

  // Preenche as correções na última fala do usuário (que chegou antes do LLM).
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

  // Anexa o áudio à última resposta da IA.
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

  function cancelRecording() {
    recorder.cancel();
    setStage('idle');
  }

  // Handler de streaming compartilhado por voz e texto.
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
      case 'turns':
        setTurns({ used: evt.turnsUsed, max: evt.turnsMax });
        break;
      case 'error':
        setError(evt.error);
        break;
    }
  }

  async function stopAndSend() {
    if (!character) return;
    const blob = await recorder.stop();
    setError(null);
    setStage('stt');
    try {
      await sendMessageStream(
        { audio: blob, conversationId, characterId: character.id, correctGrammar },
        handleEvent,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar o áudio.');
    } finally {
      setStage('idle');
    }
  }

  async function sendText(text: string) {
    if (!character) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    setStage('thinking');
    try {
      await sendMessageTextStream(
        { text: trimmed, conversationId, characterId: character.id, correctGrammar },
        handleEvent,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar a mensagem.');
    } finally {
      setStage('idle');
    }
  }

  return {
    // seleção
    meta,
    metaError,
    character,
    selectCharacter: setCharacter,
    // configurações
    correctGrammar,
    toggleGrammar,
    // conversa
    entries,
    stage,
    busy: stage !== 'idle',
    error,
    turns,
    limitReached: turns ? turns.used >= turns.max : false,
    // gravação (recorder encapsulado — a page não toca no MediaRecorder)
    isRecording: recorder.state === 'recording',
    recordSeconds: recorder.seconds,
    recorderError: recorder.error,
    startRecording: recorder.start,
    stopAndSend,
    cancelRecording,
    sendText,
  };
}
