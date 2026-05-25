# Mukagen - Modern Serial Terminal Dashboard

A professional, high-performance web-based serial terminal and telemetry dashboard. Built for engineers and developers working with embedded systems, microcontrollers (Arduino, ESP32, STM32), and industrial serial protocols.

This dashboard leverages the **Web Serial API** to provide a seamless, driverless experience directly in modern browsers (Chrome, Edge, Opera).

---

## 🚀 Key Features

### 📡 Serial Configuration
Full control over hardware communication parameters:
- **Baud Rate:** Standard (9600 to 115200) and custom rates supported.
- **Data Bits:** 7 or 8 bits.
- **Stop Bits:** 1 or 2 bits.
- **Parity:** None, Even, or Odd.
- **Flow Control:** None or Hardware (RTS/CTS).

### 🖥️ Main Views

#### 1. Console Monitor
High-fidelity data monitoring with advanced capture capabilities:
- **Display Formats:**
  - **ASCII:** Classic text-based output.
  - **Bin:** Raw binary representation.
  - **Hex:** Space-separated hexadecimal bytes.
  - **Hexdump:** Industry-standard hexdump view with address offsets and ASCII sidebar.
- **Advanced Filtering:**
  - **Text Search:** Real-time fuzzy matching across ASCII, Hex, and Binary representations.
  - **Hex Pattern:** Targeted filtering for specific byte sequences (e.g., `AA 55`).
  - **Directional Filter:** Isolate RX (Received), TX (Transmitted), or view All data.
  - **Byte Length Filter:** Filter packets by minimum/maximum size (e.g., only show packets > 10 bytes).
  - **ASCII Only:** Smart filter to hide noise/binary blobs and show only mostly-printable data.
- **Management:**
  - **Buffer Limit:** Configurable history from 500 up to 50,000 lines.
  - **Auto-Scroll:** Toggle automatic following of the latest data.
  - **Stack View:** Toggle layered layout for dense monitoring.
  - **Export:** Save your capture history to **CSV** or **JSON** for offline analysis.

#### 2. Interactive Shell
A full-featured **xterm.js** terminal emulator:
- **Display Modes:** Toggle between Text and Hex monitoring.
- **Scaling:** Dynamic **Text Zoom** to adjust font size for accessibility or density.
- **Responsive Sizing:** Manually resize the terminal panel or use "Auto-fill" to maximize workspace.
- **Terminal Reset:** One-click button to clear display and send recovery commands (`Ctrl+C`, `reset`, `stty sane`) to the remote device.
- **Receive Filtering:** Real-time string matching to isolate specific logs in the shell.

#### 3. Telemetry Plotter
Visualize real-time data from your sensors or logic:
- **Input Modes:**
  - **ASCII:** Line-based parsing (e.g., device sends `23.5\n`).
  - **Raw:** High-speed binary parsing (supports 32-bit Float and 32-bit Integer).
- **Visualization Options:**
  - **Max Samples:** Adjustable buffer size (100 to 10,000 points).
  - **Stroke Customization:** Adjustable line thickness (1px to 3px).
  - **Area Fill:** Optional shadow/gradient under the waveform for better visibility.
  - **Grid & Reference Lines:** Toggle background grids and Min/Avg/Max reference markers.
- **Interactive Tools:**
  - **Mouse Zoom:** Zoom into specific time windows using the scroll wheel.
  - **Live Statistics:** Real-time calculation of Minimum, Maximum, Average, and Sample Count.

---

### 📤 UART Transmission (Send Panel)
Powerful tools for sending data back to your hardware:
- **Formats:** Send data as **ASCII** text or **Hex** byte sequences.
- **Line Endings:** Selectable `LF`, `CR`, or `CRLF` suffixes.
- **Command History:** Stores up to 32 recent commands for quick re-transmission.
- **File Transfer:**
  - Load `.txt`, `.log`, or `.csv` files.
  - **Line Delay:** Configurable delay (0ms to 60s) between lines to prevent buffer overflow on the target device.
  - Batch transmission with progress tracking.

---

### 🎨 Personalization & UX
- **Theme Support:** Switch between **Dark** and **Light** modes.
- **Collapsible Sidebar:** Maximize terminal space while keeping real-time stats visible.
- **Real-time Metrics:** Persistent dashboard showing:
  - Total Bytes Received (RX).
  - Total Bytes Transmitted (TX).
  - Current Transfer Speed (B/s, KB/s).
  - Port Status (Online/Offline).
- **Custom Branding:** Change the App Title and choose from various icon presets (Terminal, Monitor, CPU, USB, etc.) or provide a custom icon URL.
- **Persistence:** All settings, filters, and UI preferences are automatically saved to your browser's local storage.

---

## 🛠️ Technical Stack
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Terminal Engine:** Xterm.js
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 🏁 Getting Started

### Prerequisites
- A browser that supports the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) (Chrome, Edge, Opera).
- Node.js (for development).

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build
```bash
npm run build
```
The production-ready files will be in the `dist/` directory.

---

## 📝 License
MIT
