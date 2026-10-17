import { Lightbulb } from 'lucide-react';
import type { Block } from '../data';

/** Renderiza os blocos de teoria (leitura) de um tópico. */
export function LessonContent({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      {blocks.map((b, i) => {
        switch (b.k) {
          case 'h':
            return (
              <h2 key={i} className="mt-2 text-base font-semibold">
                {b.text}
              </h2>
            );
          case 'p':
            return (
              <p key={i} className="text-foreground/90">
                {b.text}
              </p>
            );
          case 'list':
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-foreground/90">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case 'ex':
            return (
              <div key={i} className="rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2">
                {b.items.map((it, j) => (
                  <p key={j} className="italic text-foreground/90">
                    {it}
                  </p>
                ))}
              </div>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr>
                      {b.headers.map((h, j) => (
                        <th key={j} className="border bg-muted px-2 py-1 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c} className="border px-2 py-1">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'tip':
            return (
              <div
                key={i}
                className="flex gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{b.text}</span>
              </div>
            );
        }
      })}
    </div>
  );
}
