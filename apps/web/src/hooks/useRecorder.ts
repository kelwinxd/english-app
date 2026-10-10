import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_MS = 60_000; // limite de 60s por gravação (armadilha nº 1 do escopo)

type RecorderState = 'idle' | 'recording' | 'stopped';

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const resolveRef = useRef<((blob: Blob) => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);

  const cleanupTimers = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (autoStopRef.current) window.clearTimeout(autoStopRef.current);
    timerRef.current = null;
    autoStopRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolveRef.current?.(blob);
        resolveRef.current = null;
      };

      mediaRef.current = recorder;
      recorder.start();
      setState('recording');
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      autoStopRef.current = window.setTimeout(() => stopInternal(), MAX_MS);
    } catch {
      setError('Não foi possível acessar o microfone. Verifique a permissão.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopInternal = useCallback(() => {
    cleanupTimers();
    const recorder = mediaRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setState('stopped');
    }
  }, [cleanupTimers]);

  // Para a gravação e devolve o blob gravado.
  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      stopInternal();
    });
  }, [stopInternal]);

  // Cancela: para a gravação e DESCARTA o áudio (nada é enviado).
  const cancel = useCallback(() => {
    cleanupTimers();
    resolveRef.current = null; // descarta qualquer stop() pendente
    const recorder = mediaRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop(); // dispara onstop (para as tracks); resolveRef null = nada é enviado
    }
    chunksRef.current = [];
    setState('idle');
    setSeconds(0);
  }, [cleanupTimers]);

  useEffect(() => cleanupTimers, [cleanupTimers]);

  return { state, error, seconds, start, stop, cancel };
}
