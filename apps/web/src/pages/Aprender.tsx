import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TOPICS, TopicList, Lesson, Quiz, getProgress, saveBest, type Topic } from '@/features/learn';

type Phase = 'list' | 'lesson' | 'quiz' | 'result';

export function Aprender() {
  const [phase, setPhase] = useState<Phase>('list');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState(getProgress);
  const [result, setResult] = useState(0);

  function openTopic(t: Topic) {
    setTopic(t);
    setPhase('lesson');
  }

  function finishQuiz(correct: number) {
    if (topic) {
      saveBest(topic.id, correct);
      setProgress(getProgress());
    }
    setResult(correct);
    setPhase('result');
  }

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col px-4 py-4">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Início
      </Link>

      {phase === 'list' && <TopicList topics={TOPICS} progress={progress} onSelect={openTopic} />}

      {phase === 'lesson' && topic && (
        <Lesson topic={topic} onStart={() => setPhase('quiz')} onBack={() => setPhase('list')} />
      )}

      {phase === 'quiz' && topic && (
        <Quiz topic={topic} onFinish={finishQuiz} onExit={() => setPhase('list')} />
      )}

      {phase === 'result' && topic && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">Resultado — {topic.title}</p>
          <p className="my-1 text-5xl font-bold">
            {result}/{topic.questions.length}
          </p>
          <p className="mb-5 text-sm text-muted-foreground">
            {result === topic.questions.length
              ? 'Perfeito! Tópico dominado 🎉'
              : 'Bom trabalho — refaça para dominar.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPhase('quiz')}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Refazer
            </button>
            <button
              type="button"
              onClick={() => setPhase('list')}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Tópicos
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
