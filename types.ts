
export interface ProxyNode {
  ip: string;
  port: string | number;
  protocol: 'HTTP' | 'HTTPS' | 'SOCKS4' | 'SOCKS5';
  location: string;
  countryCode?: string; // ISO 3166-1 alpha-3, e.g., USA, HKG, NLD
  flag?: string; // Emoji
  anonymity?: string;
  latency?: number; // ms
  speed?: number; // MB/s
  uptime?: number; // percentage
  score?: number; // 0-100
  source?: string;
  ipVersion?: 'IPv4' | 'IPv6';
  host?: string; // For Cloudflare/CDN domains
  testTime?: number; // Timestamp
}

export interface SearchResult {
  proxies: ProxyNode[];
  sources: { title: string; uri: string }[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type Region = 'Americas' | 'Europe' | 'Asia' | 'All';
export type IpVersion = 'IPv4' | 'IPv6' | 'Any';
export type PortType = 'Custom' | 'HTTP' | 'HTTPS';
export type Language = 'CN' | 'EN' | 'AR';
export type ViewMode = 'list' | 'grid_small' | 'grid_large';
export type SearchSource = 'auto' | 'custom' | 'web';

export interface SearchParams {
  region: Region;
  country: string;
  port: string;
  portType: PortType;
  ipVersion: IpVersion;
  count: number;
}

export interface SearchHistory {
  id: string;
  timestamp: number;
  params: SearchParams;
  nodes: ProxyNode[];
  sources: { title: string; uri: string }[];
}