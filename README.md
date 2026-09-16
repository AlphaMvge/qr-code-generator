# Customizable QR Code Generator (PWA Desktop App)

A modern, offline-first QR Code Generator designed for **Windows**, **Arch Linux**, and other desktop environments. Built with React 19, Vite, Tailwind CSS, and `qrcode`.

## Features

- **Full Design Customization**:
  - Module dot shapes (square, dots, rounded, classy, squircle)
  - Corner eye frame and center eyeball styling
  - Linear gradients & solid color customization with contrast warning
  - Custom brand logo upload & center placement with automatic error correction scaling (Level H)
  - Customizable bottom call-to-action text frames ("Scan Me", "Connect Wi-Fi", etc.)
- **Multiple QR Content Types**:
  - Website URL
  - Plain Text
  - Wi-Fi Network credentials (WPA/WPA2/WEP/Open)
  - vCard contact card
  - Email & pre-filled subject/body
  - SMS & pre-filled message
  - Phone call
- **High-Quality Export**:
  - Crisp Vector **SVG** export (infinite scaling for print)
  - High-Resolution **PNG** export (up to 4096px)
  - Direct clipboard copy & print view
- **Desktop & Offline Ready (PWA)**:
  - Service Worker cache enables 100% offline generation with zero cloud telemetry.
  - Native Windows Start Menu & Taskbar support.
  - Arch Linux XDG Desktop Entry script for Rofi, Wofi, dmenu, KDE, GNOME, Hyprland, and i3.
  - Compatible with Firefox, Chrome, Edge, and Brave.

---

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation & Run

1. Clone or extract the project repository:
   ```bash
   git clone <your-github-repo-url>
   cd <repo-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

### Production Build

To compile a production build for static hosting or local preview:
```bash
npm run build
npm run preview
```
The static distribution output will be generated in the `dist/` directory.

---

## Installing as a Desktop App

### On Windows 10 / 11
1. Open the running app in Microsoft Edge or Google Chrome.
2. Click the **"Install"** icon in the address bar (or menu `...` > *Apps* > *Install this site as an app*).
3. Right-click the app in your Taskbar and choose **Pin to taskbar**.

### On Arch Linux
Run the one-line bash installer from the in-app **Windows, Arch & Firefox** install modal, or generate an XDG `.desktop` file:
```bash
cat << 'EOF' > ~/.local/share/applications/qrcode-generator.desktop
[Desktop Entry]
Version=1.0
Type=Application
Name=QR Code Generator
GenericName=QR Code Tool
Comment=Customizable QR code generator with styles, logos, and frames
Exec=chromium --app=http://localhost:3000 %U
Icon=http://localhost:3000/pwa-192x192.png
Terminal=false
StartupWMClass=crx_qrcodegen
Categories=Graphics;Utility;
Keywords=qr;barcode;generator;custom;
EOF
update-desktop-database ~/.local/share/applications/
```

---

## License

MIT
