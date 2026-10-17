import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ListChecks } from 'lucide-react';
import {
  TOPICS,
  TopicList,
  Lesson,
  Quiz,
  getProgress,
  saveBest,
  getLearned,
  setLearned,
  type Topic,
} from '@/features/learn';

type View = 'home' | 'lessonList' | 'lesson' | 'quizList' | 'quiz' | 'result';

export function Aprender() {
  const [view, setView] = useState<View>('home');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [scores, setScores] = useState(getProgress);
  const [learned, setLearnedState] = useState<string[]>(getLearned);
  const [result, setResult] = useState(0);

  const learnedCount = TOPICS.filter((t) => learned.includes(t.id)).length;

  function toggleLearned(id: string) {
    setLearnedState(setLearned(id, !learned.includes(id)));
  }

  function finishQuiz(correct: number) {
    if (topic) {
      saveBest(topic.id, correct);
      setScores(getProgress());
    }
    setResult(correct);
    setView('result');
  }

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col px-4 py-4">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Início
      </Link>

      {/* Hub: Lição x Testes */}
      {view === 'home' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <h1 className="mb-1 text-2xl font-bold">Aprender</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            Leia a teoria e teste o que aprendeu — cada parte no seu tempo.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setView('lessonList')}
              className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-semibold">Lição</span>
                <span className="text-sm text-muted-foreground">
                  Teoria dos tópicos · {learnedCount}/{TOPICS.length} aprendidas
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setView('quizList')}
              className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListChecks className="h-6 w-6" />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-semibold">Testes</span>
                <span className="text-sm text-muted-foreground">Quizzes de múltipla escolha</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de lições */}
      {view === 'lessonList' && (
        <TopicList
          title="Lições"
          subtitle={`Aprendidas: ${learnedCount}/${TOPICS.length}`}
          topics={TOPICS}
          completed={(t) => learned.includes(t.id)}
          onSelect={(t) => {
            setTopic(t);
            setView('lesson');
          }}
          onBack={() => setView('home')}
        />
      )}

      {/* Leitura de uma lição */}
      {view === 'lesson' && topic && (
        <Lesson
          topic={topic}
          learned={learned.includes(topic.id)}
          onToggleLearned={() => toggleLearned(topic.id)}
          onBack={() => setView('lessonList')}
        />
      )}

      {/* Lista de testes */}
      {view === 'quizList' && (
        <TopicList
          title="Testes"
          subtitle="Responda os quizzes e acompanhe seu melhor resultado."
          topics={TOPICS}
          completed={(t) => scores[t.id] === t.questions.length}
          badge={(t) => (scores[t.id] !== undefined ? `${scores[t.id]}/${t.questions.length}` : null)}
          onSelect={(t) => {
            setTopic(t);
            setView('quiz');
          }}
          onBack={() => setView('home')}
        />
      )}

      {/* Quiz */}
      {view === 'quiz' && topic && (
        <Quiz topic={topic} onFinish={finishQuiz} onExit={() => setView('quizList')} />
      )}

      {/* Resultado do quiz */}
      {view === 'result' && topic && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">Resultado — {topic.title}</p>
          <p className="my-1 text-5xl font-bold">
            {result}/{topic.questions.length}
          </p>
          <p className="mb-5 text-sm text-muted-foreground">
            {result === topic.questions.length
              ? 'Perfeito! 🎉'
              : 'Bom trabalho — refaça para melhorar.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('quiz')}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Refazer
            </button>
            <button
              type="button"
              onClick={() => setView('quizList')}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Testes
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
