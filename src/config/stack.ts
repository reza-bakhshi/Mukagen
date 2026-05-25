/**
 * Runtime stack versions shown in About. Keep in sync with package.json after upgrades.
 */
export const appStack = {
  react: '19.2',
  typescript: '6.0',
  vite: '8.0',
  tailwind: '4.3',
  zustand: '5.0',
  recharts: '3.8',
  xterm: '6.0',
  lucide: '1.16',
  webSerial: 'Chromium 89+',
} as const

export const builtWithSummary = [
  `React ${appStack.react}`,
  `TypeScript ${appStack.typescript}`,
  `Vite ${appStack.vite}`,
  `Tailwind CSS ${appStack.tailwind}`,
  `Zustand ${appStack.zustand}`,
  `Recharts ${appStack.recharts}`,
  `xterm.js ${appStack.xterm}`,
  `Lucide React ${appStack.lucide}`,
  `Web Serial API (${appStack.webSerial})`,
].join(' · ')
