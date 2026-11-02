import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ListChecks } from 'lucide-react';
import {
  TOPICS,
  CATEGORY_META,
  TopicList,
  CategoryPicker,
  Lesson,
  Quiz,
  getProgress,
  saveBest,
  getLearned,
  setLearned,
  type Topic,
  type Category,
} from '@/features/learn';

type View =
  | 'home'
  | 'lessonCats'
  | 'lessonList'
  | 'lesson'
  | 'quizCats'
  | 'quizList'
  | 'quiz'
  | 'result';

export function Aprender() {
  const [view, setView] = useState<View>('home');
  const [category, setCategory] = useState<Category>('tense');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [scores, setScores] = useState(getProgress);
  const [learned, setLearnedState] = useState<string[]>(getLearned);
  const [result, setResult] = useState(0);

  const learnedCount = TOPICS.filter((t) => learned.includes(t.id)).length;
  const countInCategory = (c: Category) => TOPICS.filter((t) => t.category === c).length;
  const catTopics = TOPICS.filter((t) => t.category === category);

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
              onClick={() => setView('lessonCats')}
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
              onClick={() => setView('quizCats')}
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

      {/* Lições: escolher categoria */}
      {view === 'lessonCats' && (
        <CategoryPicker
          title="Lições"
          subtitle="Escolha o que estudar."
          count={countInCategory}
          onPick={(c) => {
            setCategory(c);
            setView('lessonList');
          }}
          onBack={() => setView('home')}
        />
      )}

      {/* Lista de lições da categoria escolhida */}
      {view === 'lessonList' && (
        <TopicList
          title={CATEGORY_META[category].label}
          subtitle={`${CATEGORY_META[category].symbol} Aprendidas: ${
            catTopics.filter((t) => learned.includes(t.id)).length
          }/${catTopics.length}`}
          topics={catTopics}
          completed={(t) => learned.includes(t.id)}
          onSelect={(t) => {
            setTopic(t);
            setView('lesson');
          }}
          onBack={() => setView('lessonCats')}
          backLabel="Lições"
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

      {/* Testes: escolher categoria */}
      {view === 'quizCats' && (
        <CategoryPicker
          title="Testes"
          subtitle="Escolha o tipo de quiz."
          count={countInCategory}
          onPick={(c) => {
            setCategory(c);
            setView('quizList');
          }}
          onBack={() => setView('home')}
        />
      )}

      {/* Lista de testes da categoria escolhida */}
      {view === 'quizList' && (
        <TopicList
          title={CATEGORY_META[category].label}
          subtitle={`${CATEGORY_META[category].symbol} Quizzes de múltipla escolha`}
          topics={catTopics}
          completed={(t) => scores[t.id] === t.questions.length}
          badge={(t) => (scores[t.id] !== undefined ? `${scores[t.id]}/${t.questions.length}` : null)}
          onSelect={(t) => {
            setTopic(t);
            setView('quiz');
          }}
          onBack={() => setView('quizCats')}
          backLabel="Testes"
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
