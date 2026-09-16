export type QRContentType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'sms'
  | 'crypto'
  | 'event'
  | 'geo';

export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'diamond' | 'star';
export type CornerSquareStyle = 'square' | 'extra-rounded' | 'dot';
export type CornerDotStyle = 'square' | 'dot';
export type GradientType = 'none' | 'linear' | 'radial';
export type FrameStyle = 'none' | 'bottom-banner' | 'top-header' | 'polaroid' | 'badge' | 'minimal-border';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface WifiData {
  ssid: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  password: string;
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  country: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface SMSData {
  phone: string;
  message: string;
}

export interface CryptoData {
  network: 'bitcoin' | 'ethereum' | 'solana' | 'usdt';
  address: string;
  amount: string;
  label: string;
}

export interface EventData {
  title: string;
  location: string;
  start: string;
  end: string;
  description: string;
}

export interface GeoData {
  latitude: string;
  longitude: string;
  query: string;
}

export interface LogoConfig {
  enabled: boolean;
  type: 'none' | 'preset' | 'custom';
  presetId: string;
  customDataUrl?: string;
  size: number; // 0.15 to 0.35 (fraction of QR width)
  padding: number; // 0 to 8
  roundBackdrop: boolean;
  backdropColor: string;
}

export interface FrameConfig {
  style: FrameStyle;
  text: string;
  textColor: string;
  frameColor: string;
  fontFamily: string;
}

export interface QRDesignConfig {
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  fgColor: string;
  fgColor2: string;
  gradientType: GradientType;
  gradientAngle: number;
  bgColor: string;
  transparentBg: boolean;
  customCornerColor: boolean;
  cornerSquareColor: string;
  cornerDotColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  resolution: number;
  logo: LogoConfig;
  frame: FrameConfig;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  config: Partial<QRDesignConfig>;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: QRContentType;
  previewTitle: string;
  rawText: string;
  config: QRDesignConfig;
}
