# Serial Terminal Dashboard

Chrome/Edge web app for embedded serial diagnostics: **Web Serial API**, **xterm.js** shell, console capture, and a live plotter.

## Stack (current)

| Layer | Technology | Version |
|--------|------------|---------|
| UI | React | 19.2 |
| Language | TypeScript | 6.0 |
| Build | Vite | 8.0 |
| Styling | Tailwind CSS | 4.3 |
| State | Zustand | 5.0 |
| Charts | Recharts | 3.8 |
| Terminal | @xterm/xterm + Fit + Web Links | 6.0 |
| Icons | Lucide React | 1.16 |
| Serial I/O | Web Serial API (`navigator.serial`) | Browser |

Update dependencies:

```bash
npm install
npm update
npm run build
```

## Features

- **Console** — RX/TX capture, filters, export, text zoom
- **Shell** — interactive xterm passthrough
- **Plotter** — ASCII/binary numeric stream, FIFO buffer, chart settings
- **Settings** — buffer size, header title/icon, persisted locally
- **Sidebar** — UART config, stats, navigation

## Requirements

- Google Chrome or Microsoft Edge 89+
- Secure context: HTTPS or `http://localhost`
- User gesture for `navigator.serial.requestPort()`

## Quick start

```bash
npm install
npm run dev
```

Open the local URL, use **Connect** in the sidebar, and pick your USB serial device.

## Project layout

```
src/
  hooks/useSerialPort.ts       # Web Serial read/write loop
  components/SerialTerminal.tsx
  components/PacketCaptureBuffer.tsx
  components/TelemetryChart.tsx
  views/                       # Console, Shell, Plotter, Settings, About
  store/serialStore.ts
  utils/appSettings.ts         # Persisted preferences (localStorage)
  types/web-serial.d.ts        # Web Serial typings
```

## License

MIT
