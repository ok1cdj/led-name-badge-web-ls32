import { useRef } from 'react';

interface MessageEditorProps {
  value: string;
  onChange: (text: string) => void;
}

const ICON_BUTTONS = [
  { name: 'ball', emoji: '●' },
  { name: 'happy', emoji: '☺' },
  { name: 'heart', emoji: '♡' },
  { name: 'HEART', emoji: '♥' },
];

export default function MessageEditor({ value, onChange }: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertAtCursor(insert: string) {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + insert);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      el.selectionStart = start + insert.length;
      el.selectionEnd = start + insert.length;
      el.focus();
    });
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Message</h2>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Type your message here…"
        className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 font-mono text-sm resize-none focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 mr-1">Insert icon:</span>
        {ICON_BUTTONS.map(({ name, emoji }) => (
          <button
            key={name}
            onClick={() => insertAtCursor(`:${name}:`)}
            title={`:${name}:`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 transition-all"
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="text-xs font-mono text-zinc-400 hover:text-amber-400">:{name}:</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        Use <code className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">:iconname:</code> for icons{' '}
        &bull; <code className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">::</code> for a literal colon
      </p>
    </div>
  );
}
