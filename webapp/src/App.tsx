import { useState } from 'react';
import ConnectButton from './components/ConnectButton';
import MessageEditor from './components/MessageEditor';
import LEDPreview from './components/LEDPreview';
import Settings from './components/Settings';
import { encodeMessage, buildPacket, type MessageConfig } from './lib/protocol';
import { connectDevice, sendData } from './lib/webhid';

const BRIGHTNESS_VALUES = [0x00, 0x10, 0x20, 0x40];

const DEFAULT_MESSAGE: MessageConfig = { text: '', speed: 4, mode: 0, blink: false, ants: false };

export default function App() {
  const [device, setDevice] = useState<HIDDevice | null>(null);
  const [messages, setMessages] = useState<MessageConfig[]>([{ ...DEFAULT_MESSAGE, text: 'Hello World' }]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const active = messages[activeIdx];
  const encoded = encodeMessage(active.text);

  function updateActive(patch: Partial<MessageConfig>) {
    setMessages(msgs => msgs.map((m, i) => i === activeIdx ? { ...m, ...patch } : m));
  }

  function addMessage() {
    if (messages.length >= 8) return;
    setMessages(msgs => [...msgs, { ...DEFAULT_MESSAGE }]);
    setActiveIdx(messages.length);
  }

  function removeMessage(idx: number) {
    if (messages.length <= 1) return;
    setMessages(msgs => msgs.filter((_, i) => i !== idx));
    setActiveIdx(prev => Math.min(prev, messages.length - 2));
  }

  async function handleConnect() {
    setError(''); setStatus('');
    try {
      const dev = await connectDevice();
      setDevice(dev);
      setStatus('Badge connected.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleDisconnect() {
    if (device?.opened) device.close().catch(() => undefined);
    setDevice(null);
    setStatus('Disconnected.');
  }

  async function handleSend() {
    if (!device) { setError('No badge connected.'); return; }
    setError(''); setStatus(''); setSending(true);
    try {
      const packet = buildPacket(messages, BRIGHTNESS_VALUES[brightness]);
      await sendData(device, packet);
      setStatus(`Sent ${messages.length} message${messages.length > 1 ? 's' : ''} successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      if (!device.opened) setDevice(null);
    } finally {
      setSending(false);
    }
  }

  const hidSupported = typeof navigator !== 'undefined' && 'hid' in navigator;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <span className="text-amber-400 text-lg">⬛</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">LED Badge Controller</h1>
              <p className="text-xs text-zinc-500">LS32 · Web HID</p>
            </div>
          </div>
          <ConnectButton device={device} onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!hidSupported && (
          <div className="rounded-xl bg-yellow-900/20 border border-yellow-600/40 p-4 flex gap-3 items-start">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-300">Browser not supported</p>
              <p className="text-sm text-yellow-400/70 mt-0.5">Web HID requires Google Chrome or Microsoft Edge.</p>
            </div>
          </div>
        )}

        {/* Message list */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Messages</h2>
            <button
              onClick={addMessage}
              disabled={messages.length >= 8}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add ({messages.length}/8)
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all',
                  idx === activeIdx
                    ? 'bg-amber-500/10 border-amber-500/50'
                    : 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-600',
                ].join(' ')}
              >
                <span className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  idx === activeIdx ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-zinc-300',
                ].join(' ')}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm font-mono text-zinc-300 truncate min-w-0">
                  {msg.text || <span className="text-zinc-600 italic">empty</span>}
                </span>
                <span className="text-xs text-zinc-500 flex-shrink-0">
                  {['←', '→', '↑', '↓', '■', '◎', '▼', '▦', '✦'][msg.mode]} spd {msg.speed}
                </span>
                {messages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMessage(idx); }}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Remove message"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor for active message */}
        <MessageEditor value={active.text} onChange={(text) => updateActive({ text })} />

        {/* Preview */}
        <LEDPreview bitmap={encoded.bitmap} cols={encoded.cols} />

        {/* Per-message settings */}
        <Settings
          speed={active.speed}
          mode={active.mode}
          brightness={brightness}
          blink={active.blink}
          ants={active.ants}
          onChange={(s) => {
            const { brightness: b, ...msgSettings } = s;
            if (b !== undefined) setBrightness(b);
            if (Object.keys(msgSettings).length > 0) updateActive(msgSettings);
          }}
        />

        {/* Send */}
        <div className="flex flex-col items-stretch gap-3">
          <button
            onClick={handleSend}
            disabled={!device || sending}
            className={[
              'w-full py-3 rounded-xl font-semibold text-base transition-all',
              device && !sending
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-900/30 active:scale-[0.98]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700',
            ].join(' ')}
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Sending…
              </span>
            ) : (
              `Send ${messages.length} Message${messages.length > 1 ? 's' : ''} to Badge`
            )}
          </button>
          {!device && hidSupported && (
            <p className="text-center text-xs text-zinc-500">Connect a badge to enable sending.</p>
          )}
        </div>

        {status && !error && (
          <div className="rounded-lg bg-green-900/30 border border-green-700/50 px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-300">{status}</span>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        <footer className="pt-4 pb-6 text-center text-xs text-zinc-600 space-y-2">
          <p>
            LED Badge LS32 Controller &bull; Uses{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API" className="underline hover:text-zinc-400 transition-colors" target="_blank" rel="noreferrer">
              Web HID API
            </a>
            {' '}&bull; Chrome / Edge only
          </p>
          <p>
            By{' '}
            <span className="text-zinc-400 font-medium">Ondrej Kolonicny</span>
            {' '}<span className="text-amber-600">OK1CDJ</span>
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href="https://buymeacoffee.com/ok1cdj"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all text-xs font-medium"
            >
              ☕ Buy me a coffee
            </a>
            <a
              href="https://revolut.me/ok1cdj"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-xs font-medium"
            >
              💳 Revolut Pay
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
