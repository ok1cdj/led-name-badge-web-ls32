export async function connectDevice(): Promise<HIDDevice> {
  if (!navigator.hid) {
    throw new Error('Web HID API is not supported in this browser. Please use Chrome or Edge.');
  }

  const devices = await navigator.hid.requestDevice({
    filters: [{ vendorId: 0x0416, productId: 0x5020 }],
  });

  if (devices.length === 0) {
    throw new Error('No device selected.');
  }

  const device = devices[0];

  if (!device.opened) {
    await device.open();
  }

  return device;
}

export async function sendData(device: HIDDevice, data: Uint8Array): Promise<void> {
  if (!device.opened) {
    await device.open();
  }

  const CHUNK_SIZE = 64;

  for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
    let chunk: Uint8Array;
    const remaining = data.length - offset;

    if (remaining >= CHUNK_SIZE) {
      chunk = data.slice(offset, offset + CHUNK_SIZE);
    } else {
      // Pad the last chunk to 64 bytes
      chunk = new Uint8Array(CHUNK_SIZE);
      chunk.set(data.slice(offset));
    }

    await device.sendReport(0, chunk);
  }
}
