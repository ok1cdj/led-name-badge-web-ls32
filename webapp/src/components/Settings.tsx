interface SettingsProps {
  speed: number;
  mode: number;
  brightness: number;
  blink: boolean;
  ants: boolean;
  onChange: (settings: Partial<{ speed: number; mode: number; brightness: number; blink: boolean; ants: boolean }>) => void;
}

const MODE_NAMES = [
  'Scroll Left',
  'Scroll Right',
  'Scroll Up',
  'Scroll Down',
  'Still Centered',
  'Animation',
  'Drop Down',
  'Curtain',
  'Laser',
];

const BRIGHTNESS_OPTIONS = [
  { label: '100%', value: 0 },
  { label: '75%', value: 1 },
  { label: '50%', value: 2 },
  { label: '25%', value: 3 },
];

export default function Settings({ speed, mode, brightness, blink, ants, onChange }: SettingsProps) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Settings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Speed</label>
            <span className="text-sm font-mono text-amber-400">{speed}</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={speed}
            onChange={(e) => onChange({ speed: parseInt(e.target.value, 10) })}
            className="w-full h-2 rounded-full appearance-none bg-zinc-700 accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Mode</label>
          <select
            value={mode}
            onChange={(e) => onChange({ mode: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          >
            {MODE_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Brightness</label>
          <select
            value={brightness}
            onChange={(e) => onChange({ brightness: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          >
            {BRIGHTNESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-3 flex flex-col justify-center">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={blink}
                onChange={(e) => onChange({ blink: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 rounded-full bg-zinc-700 peer-checked:bg-amber-500 transition-colors"></div>
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Blink</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={ants}
                onChange={(e) => onChange({ ants: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 rounded-full bg-zinc-700 peer-checked:bg-amber-500 transition-colors"></div>
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Ants (animated border)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
