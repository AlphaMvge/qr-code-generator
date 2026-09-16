import {
  QRContentType,
  WifiData,
  VCardData,
  EmailData,
  SMSData,
  CryptoData,
  EventData,
  GeoData,
} from '../types';

export function formatWifiPayload(data: WifiData): string {
  const enc = data.encryption === 'nopass' ? 'nopass' : data.encryption;
  const pass = data.encryption === 'nopass' ? '' : data.password;
  const hidden = data.hidden ? 'true' : 'false';
  return `WIFI:T:${enc};S:${escapeWifi(data.ssid)};P:${escapeWifi(pass)};H:${hidden};;`;
}

function escapeWifi(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

export function formatVCardPayload(data: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${[data.firstName, data.lastName].filter(Boolean).join(' ')}`,
  ];
  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);
  if (data.street || data.city || data.country) {
    lines.push(`ADR;TYPE=WORK:;;${data.street};${data.city};;;${data.country}`);
  }
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function formatEmailPayload(data: EmailData): string {
  const params: string[] = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${data.to}${query}`;
}

export function formatSMSPayload(data: SMSData): string {
  return `SMSTO:${data.phone}:${data.message}`;
}

export function formatCryptoPayload(data: CryptoData): string {
  if (data.network === 'bitcoin') {
    let uri = `bitcoin:${data.address}`;
    const params: string[] = [];
    if (data.amount) params.push(`amount=${data.amount}`);
    if (data.label) params.push(`label=${encodeURIComponent(data.label)}`);
    if (params.length) uri += `?${params.join('&')}`;
    return uri;
  }
  if (data.network === 'ethereum') {
    let uri = `ethereum:${data.address}`;
    if (data.amount) uri += `?value=${data.amount}`;
    return uri;
  }
  if (data.network === 'solana') {
    let uri = `solana:${data.address}`;
    if (data.amount) uri += `?amount=${data.amount}`;
    return uri;
  }
  // Generic or USDT
  return `${data.address}`;
}

export function formatEventPayload(data: EventData): string {
  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    return isoStr.replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startUtc = data.start ? formatDate(new Date(data.start).toISOString()) : '';
  const endUtc = data.end ? formatDate(new Date(data.end).toISOString()) : '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${data.title || 'Event'}`,
  ];
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (startUtc) lines.push(`DTSTART:${startUtc}`);
  if (endUtc) lines.push(`DTEND:${endUtc}`);
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\n');
}

export function formatGeoPayload(data: GeoData): string {
  if (data.latitude && data.longitude) {
    return data.query
      ? `geo:${data.latitude},${data.longitude}?q=${encodeURIComponent(data.query)}`
      : `geo:${data.latitude},${data.longitude}`;
  }
  return data.query ? `geo:0,0?q=${encodeURIComponent(data.query)}` : 'geo:0,0';
}

export function generatePayload(
  type: QRContentType,
  state: {
    url: string;
    text: string;
    wifi: WifiData;
    vcard: VCardData;
    email: EmailData;
    sms: SMSData;
    crypto: CryptoData;
    event: EventData;
    geo: GeoData;
  }
): string {
  switch (type) {
    case 'url': {
      let u = state.url.trim();
      if (!u) return 'https://google.com';
      if (!/^https?:\/\//i.test(u) && !/^mailto:/i.test(u)) {
        u = 'https://' + u;
      }
      return u;
    }
    case 'text':
      return state.text || 'Hello, World!';
    case 'wifi':
      return formatWifiPayload(state.wifi);
    case 'vcard':
      return formatVCardPayload(state.vcard);
    case 'email':
      return formatEmailPayload(state.email);
    case 'sms':
      return formatSMSPayload(state.sms);
    case 'crypto':
      return formatCryptoPayload(state.crypto);
    case 'event':
      return formatEventPayload(state.event);
    case 'geo':
      return formatGeoPayload(state.geo);
    default:
      return 'https://google.com';
  }
}
