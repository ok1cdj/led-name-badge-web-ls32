import { getCharBitmap, ICONS } from './font';

export type MessageConfig = {
  text: string;
  speed: number;  // 1-8
  mode: number;   // 0-8
  blink: boolean;
  ants: boolean;
};

/**
 * Parse text with :icon: notation and build column bitmap.
 * - '::'  -> literal ':'
 * - ':name:' -> icon bitmap if known, otherwise render as ':' + chars + ':'
 * Each character contributes 11 bytes (columns) to the bitmap.
 * Returns { bitmap: Uint8Array, cols: number }
 */
export function encodeMessage(text: string): { bitmap: Uint8Array; cols: number } {
  const columns: Uint8Array[] = [];

  // Tokenize: split on :word: patterns
  const tokenRegex = /::|(:[a-zA-Z]+:)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Emit any plain text before this match
    const plain = text.slice(lastIndex, match.index);
    for (const ch of plain) {
      columns.push(getCharBitmap(ch));
    }

    if (match[0] === '::') {
      // Literal colon
      columns.push(getCharBitmap(':'));
    } else {
      // Icon token like :ball:
      const iconName = match[0].slice(1, -1); // strip leading/trailing ':'
      if (ICONS[iconName]) {
        columns.push(ICONS[iconName]);
      } else {
        // Unknown icon name: render as literal text
        for (const ch of match[0]) {
          columns.push(getCharBitmap(ch));
        }
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Emit trailing plain text
  const tail = text.slice(lastIndex);
  for (const ch of tail) {
    columns.push(getCharBitmap(ch));
  }

  if (columns.length === 0) {
    return { bitmap: new Uint8Array(0), cols: 0 };
  }

  const cols = columns.length;
  const bitmap = new Uint8Array(cols * 11);
  for (let i = 0; i < columns.length; i++) {
    bitmap.set(columns[i], i * 11);
  }

  return { bitmap, cols };
}

/**
 * Build the full HID packet (header + bitmap data).
 * Returns Uint8Array padded to a multiple of 64 bytes.
 */
export function buildPacket(messages: MessageConfig[], brightness: number = 0x00): Uint8Array {
  // Encode all messages
  const encoded = messages.map((msg) => encodeMessage(msg.text));

  // Build 64-byte header
  const header = new Uint8Array(64);

  // Magic bytes
  header[0] = 0x77;
  header[1] = 0x61;
  header[2] = 0x6e;
  header[3] = 0x67;

  header[4] = 0x00;
  header[5] = brightness;

  // Blink bitmask
  let blinkMask = 0;
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].blink) blinkMask |= (1 << i);
  }
  header[6] = blinkMask;

  // Ants bitmask
  let antsMask = 0;
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].ants) antsMask |= (1 << i);
  }
  header[7] = antsMask;

  // Speed + mode bytes (bytes 8-15, one per message slot)
  for (let i = 0; i < 8; i++) {
    if (i < messages.length) {
      header[8 + i] = (messages[i].speed - 1) * 16 + messages[i].mode;
    } else {
      header[8 + i] = 0;
    }
  }

  // Per-message column counts as big-endian 16-bit (bytes 16-31)
  for (let i = 0; i < 8; i++) {
    const colCount = i < encoded.length ? encoded[i].cols : 0;
    header[16 + i * 2] = (colCount >> 8) & 0xff;
    header[17 + i * 2] = colCount & 0xff;
  }

  // Bytes 32-37: zeros (already zero from new Uint8Array)

  // Bytes 38-43: current date/time
  const now = new Date();
  header[38] = now.getFullYear() % 100;
  header[39] = now.getMonth() + 1;
  header[40] = now.getDate();
  header[41] = now.getHours();
  header[42] = now.getMinutes();
  header[43] = now.getSeconds();

  // Bytes 44-63: zeros (already zero)

  // Concatenate all bitmaps
  let totalBitmapBytes = 0;
  for (const enc of encoded) {
    totalBitmapBytes += enc.bitmap.length;
  }

  // Total data = header + all bitmaps, padded to 64-byte boundary
  const totalBeforePad = 64 + totalBitmapBytes;
  const padded = Math.ceil(totalBeforePad / 64) * 64;
  const packet = new Uint8Array(padded);

  packet.set(header, 0);

  let offset = 64;
  for (const enc of encoded) {
    packet.set(enc.bitmap, offset);
    offset += enc.bitmap.length;
  }

  return packet;
}
