import { useEffect, useRef } from 'react';

interface LEDPreviewProps {
  bitmap: Uint8Array;
  cols: number;
}

const PIXEL_SIZE = 5;
const PIXEL_GAP = 1;
const ROWS = 11;
const PADDING_X = 14;
const PADDING_Y = 10;
const BORDER_RADIUS = 10;

const COLOR_LIT = '#ffaa00';
const COLOR_UNLIT = '#1a0800';
const COLOR_BG = '#0d0400';
const COLOR_FRAME = '#2a2520';
const COLOR_FRAME_HIGHLIGHT = '#3a3530';

export default function LEDPreview({ bitmap, cols }: LEDPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Each byte-column is 8 LED pixels wide
  const ledCols = Math.max(cols * 8, 8);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = PIXEL_SIZE + PIXEL_GAP;
    const innerW = ledCols * cellSize - PIXEL_GAP;
    const innerH = ROWS * cellSize - PIXEL_GAP;
    const totalW = innerW + PADDING_X * 2;
    const totalH = innerH + PADDING_Y * 2;

    canvas.width = totalW;
    canvas.height = totalH;

    // Draw frame background
    ctx.fillStyle = COLOR_FRAME;
    roundRect(ctx, 0, 0, totalW, totalH, BORDER_RADIUS);
    ctx.fill();

    // Subtle highlight on top edge
    ctx.fillStyle = COLOR_FRAME_HIGHLIGHT;
    roundRect(ctx, 0, 0, totalW, 3, BORDER_RADIUS);
    ctx.fill();

    // Draw LED display area
    ctx.fillStyle = COLOR_BG;
    roundRect(ctx, PADDING_X - 4, PADDING_Y - 4, innerW + 8, innerH + 8, 4);
    ctx.fill();

    // Draw pixels
    // bitmap layout: cols * 11 bytes, 11 bytes per byte-column (one byte per row, 8 pixels per byte, MSB=left)
    for (let ledCol = 0; ledCol < ledCols; ledCol++) {
      const byteCol = Math.floor(ledCol / 8);
      const bit = 7 - (ledCol % 8);
      for (let row = 0; row < ROWS; row++) {
        const byte = byteCol < cols ? bitmap[byteCol * 11 + row] : 0;
        const lit = (byte >> bit) & 1;
        const x = PADDING_X + ledCol * cellSize;
        const y = PADDING_Y + row * cellSize;

        ctx.fillStyle = lit ? COLOR_LIT : COLOR_UNLIT;
        ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);

        if (lit) {
          ctx.shadowColor = COLOR_LIT;
          ctx.shadowBlur = 4;
          ctx.fillStyle = COLOR_LIT;
          ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
          ctx.shadowBlur = 0;
        }
      }
    }
  }, [bitmap, cols, ledCols]);

  const cellSize = PIXEL_SIZE + PIXEL_GAP;
  const innerW = ledCols * cellSize - PIXEL_GAP;
  const innerH = ROWS * cellSize - PIXEL_GAP;
  const totalW = innerW + PADDING_X * 2;
  const totalH = innerH + PADDING_Y * 2;

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Preview</h2>
        <span className="text-xs text-zinc-500 font-mono">{cols} columns</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex justify-start">
          <canvas
            ref={canvasRef}
            width={totalW}
            height={totalH}
            className="rounded-lg"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
