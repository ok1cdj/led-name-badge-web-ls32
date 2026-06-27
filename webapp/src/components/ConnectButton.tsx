interface ConnectButtonProps {
  device: HIDDevice | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectButton({ device, onConnect, onDisconnect }: ConnectButtonProps) {
  const hidSupported = typeof navigator !== 'undefined' && 'hid' in navigator;

  if (!hidSupported) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-900/40 border border-yellow-600/50 text-yellow-300 text-sm">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Web HID not supported. Use Chrome or Edge.
      </div>
    );
  }

  if (device) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/40 border border-green-600/50">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-green-300 text-sm font-medium">Connected</span>
        </div>
        <button
          onClick={onDisconnect}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="px-4 py-2 rounded-lg font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-colors shadow-lg shadow-amber-900/30"
    >
      Connect Badge
    </button>
  );
}
