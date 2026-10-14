import type { Character, Entry, Stage } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { RecorderControls } from './RecorderControls';

/**
 * Janela de chat fixa (padrão de app de mensagem): header no topo e controles
 * no rodapé não rolam; apenas a lista de mensagens tem scroll interno.
 * Deve viver dentro de um pai de altura fixa (ex.: h-dvh) como filho flex.
 */
export function ChatWindow(props: {
  character: Character;
  turns: { used: number; max: number } | null;
  correctGrammar: boolean;
  onToggleGrammar: () => void;
  entries: Entry[];
  stage: Stage;
  error: string | null;
  limitReached: boolean;
  isRecording: boolean;
  recordSeconds: number;
  recorderError: string | null;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onSend: (text: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-background">
      <div className="shrink-0 border-b px-4 pt-4">
        <ChatHeader
          character={props.character}
          turns={props.turns}
          correctGrammar={props.correctGrammar}
          onToggleGrammar={props.onToggleGrammar}
        />
      </div>

      <MessageList entries={props.entries} stage={props.stage} />

      <div className="shrink-0 border-t px-4 py-2">
        {props.error && <p className="mb-2 text-sm text-destructive">{props.error}</p>}
        <RecorderControls
          limitReached={props.limitReached}
          isRecording={props.isRecording}
          seconds={props.recordSeconds}
          busy={props.busy}
          hint={props.recorderError}
          onStart={props.onStart}
          onStop={props.onStop}
          onCancel={props.onCancel}
          onSend={props.onSend}
        />
      </div>
    </div>
  );
}
