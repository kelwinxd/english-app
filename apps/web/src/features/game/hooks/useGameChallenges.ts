import { useEffect, useState } from 'react';
import { fetchChallenges } from '../api/gameApi';
import type { Challenge, Level } from '../types';

/** Carrega os desafios de uma sessão de jogo. `reload` gera uma nova leva. */
export function useGameChallenges(level: Level) {
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setChallenges(null);

    fetchChallenges(level, 10)
      .then((r) => {
        if (active) {
          setChallenges(r.challenges);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Falha ao carregar os desafios.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [level, nonce]);

  return { challenges, loading, error, reload: () => setNonce((n) => n + 1) };
}
