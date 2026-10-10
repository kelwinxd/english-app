import { useChat, BackLink, CharacterPicker, ChatWindow } from '@/features/chat';

export function Conversar() {
  const {
    meta,
    metaError,
    character,
    selectCharacter,
    correctGrammar,
    toggleGrammar,
    entries,
    stage,
    busy,
    error,
    turns,
    limitReached,
    isRecording,
    recordSeconds,
    recorderError,
    startRecording,
    stopAndSend,
    cancelRecording,
  } = useChat();

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col px-4 py-4">
      <BackLink />

      {!character ? (
        <div className="flex-1 overflow-y-auto">
          <CharacterPicker meta={meta} error={metaError} onSelect={selectCharacter} />
        </div>
      ) : (
        <ChatWindow
          character={character}
          turns={turns}
          correctGrammar={correctGrammar}
          onToggleGrammar={toggleGrammar}
          entries={entries}
          stage={stage}
          error={error}
          limitReached={limitReached}
          isRecording={isRecording}
          recordSeconds={recordSeconds}
          recorderError={recorderError}
          busy={busy}
          onStart={startRecording}
          onStop={stopAndSend}
          onCancel={cancelRecording}
        />
      )}
    </main>
  );
}
