
import React, { useState, useMemo, useEffect } from 'react';
import { findProxies, performSpeedTest, fetchPublicProxies } from './services/geminiService';
import { ProxyNode, AppStatus, Region, SearchParams, PortType, SearchHistory, Language, ViewMode, SearchSource } from './types';
import { ResponsiveContainer, Tooltip } from 'recharts';
import { Search, RefreshCw, ExternalLink, Settings2, FileSpreadsheet, Copy, AlertCircle, Activity, History, CloudUpload, Globe, Satellite, List, LayoutGrid, Grid3X3, Database, Terminal, Link2, Zap, CheckSquare, Square, PlusCircle, Filter, Smartphone, Monitor, Download, Trash2, AppWindow, Clock, Network, Github, MoreVertical, Command, Apple } from 'lucide-react';
import { ProxyCard } from './components/ProxyCard';

// Translations
const TRANSLATIONS = {
  CN: {
    title: "Proxy IP Scout",
    region: "区域",
    country: "国家",
    ipVersion: "IP 版本",
    portMode: "端口模式",
    count: "AI 搜索数量",
    search: "开始扫描",
    scanning: "扫描中...",
    testing: "测速中...",
    analyzing: "深度分析",
    analyzingDesc: "正在测试连通性 (线程限制: 80)",
    idleTitle: "Proxy IP Scout",
    idleDesc: "AI 驱动代理发现 | 自定义 IP 测试 | 优选源",
    recentScans: "最近扫描",
    sources: "来源 & 存档",
    saved: "已存",
    copyAll: "复制全部",
    exportCSV: "导出 CSV",
    report: "上报数据",
    history: "历史记录",
    showAll: "显示所有",
    noProxies: "当前过滤器下无代理 (延迟 > 800ms 已隐藏)",
    allPorts: "所有端口",
    allRegions: "所有区域",
    type: "类型",
    high: "高匿/精英",
    transparent: "透明",
    all: "全部",
    custom: "自定义",
    settings: "API 设置",
    reportSuccess: "上报成功!",
    reportFail: "上报失败",
    apiUrlPlace: "输入 API URL (Cloudflare Worker / GitHub)",
    tokenPlace: "Token (可选)",
    sourceAuto: "智能搜索",
    sourceCustom: "自定义粘贴",
    sourceWeb: "网络优选源",
    sourceApps: "客户端推荐",
    pastePlaceholder: "支持格式: 1.1.1.1 或 1.1.1.1:80 或 1.1.1.1#Tag 或 [IPv6]:80#Tag (支持换行/逗号)",
    viewMode: "视图",
    list: "列表",
    small: "紧凑",
    large: "卡片",
    modeAi: "AI 生成",
    modeWeb: "网络优选",
    testSelected: "一键测试选中源",
    appendResults: "合并到结果列表",
    portFilter: "端口筛选",
    source: "来源",
    platform: "平台",
    clearHistory: "清空历史",
    restore: "加载",
    githubRepo: "GitHub 仓库",
    actions: "导出/复制",
    selected: "已选",
    useWebSources: "同时搜索网络优选源 (可选)"
  },
  EN: {
    title: "Proxy IP Scout",
    region: "Region",
    country: "Country",
    ipVersion: "IP Version",
    portMode: "Port Mode",
    count: "AI Count",
    search: "Start Scan",
    scanning: "Scanning...",
    testing: "Testing...",
    analyzing: "Deep Analysis",
    analyzingDesc: "Testing connectivity (Thread limit: 80)",
    idleTitle: "Proxy IP Scout",
    idleDesc: "AI-Powered Discovery | Custom IP Test | Web Sources",
    recentScans: "Recent Scans",
    sources: "Sources & Archive",
    saved: "Saved",
    copyAll: "Copy All",
    exportCSV: "Export CSV",
    report: "Report Data",
    history: "History",
    showAll: "Show All",
    noProxies: "No proxies match filters (Latency > 800ms hidden)",
    allPorts: "All Ports",
    allRegions: "All Regions",
    type: "Type",
    high: "High/Elite",
    transparent: "Transparent",
    all: "All",
    custom: "Custom",
    settings: "API Settings",
    reportSuccess: "Reported Successfully!",
    reportFail: "Report Failed",
    apiUrlPlace: "Enter API URL (CF Worker / GitHub)",
    tokenPlace: "Token (Optional)",
    sourceAuto: "Auto Search",
    sourceCustom: "Custom Paste",
    sourceWeb: "Web Sources",
    sourceApps: "Client Apps",
    pastePlaceholder: "Formats: 1.1.1.1 or 1.1.1.1:80 or 1.1.1.1#Tag or [IPv6]:80#Tag (Newline/Comma)",
    viewMode: "View",
    list: "List",
    small: "Compact",
    large: "Card",
    modeAi: "AI Generation",
    modeWeb: "Web Sources",
    testSelected: "Test Selected",
    appendResults: "Append Results",
    portFilter: "Filter Port",
    source: "Source",
    platform: "Platform",
    clearHistory: "Clear History",
    restore: "Load",
    githubRepo: "GitHub Repository",
    actions: "Actions",
    selected: "Selected",
    useWebSources: "Include Web Sources (Optional)"
  },
  AR: {
    title: "Proxy IP Scout",
    region: "المنطقة",
    country: "الدولة",
    ipVersion: "إصدار IP",
    portMode: "نمط المنفذ",
    count: "العدد",
    search: "بدء المسح",
    scanning: "جاري المسح...",
    testing: "جاري الاختبار...",
    analyzing: "تحليل عميق",
    analyzingDesc: "اختبار الاتصال (حد الخيوط: 80)",
    idleTitle: "Proxy IP Scout",
    idleDesc: "اكتشاف بالذكاء الاصطناعي | اختبار مخصص | مصادر الويب",
    recentScans: "عمليات المسح الأخيرة",
    sources: "المصادر والأرشيف",
    saved: "محفوظ",
    copyAll: "نسخ الكل",
    exportCSV: "تصدير CSV",
    report: "رفع البيانات",
    history: "السجل",
    showAll: "إظهار الكل",
    noProxies: "لا توجد وكلاء يطابقون المرشحات",
    allPorts: "جميع المنافذ",
    allRegions: "جميع المناطق",
    type: "النوع",
    high: "نخبة/عالي",
    transparent: "شفاف",
    all: "الكل",
    custom: "مخصص",
    settings: "إعدادات API",
    reportSuccess: "تم الرفع بنجاح!",
    reportFail: "فشل الرفع",
    apiUrlPlace: "رابط API (CF Worker / GitHub)",
    tokenPlace: "الرمز (اختياري)",
    sourceAuto: "بحث تلقائي AI",
    sourceCustom: "لصق مخصص",
    sourceWeb: "مصادر الويب",
    sourceApps: "تطبيقات الوكيل",
    pastePlaceholder: "الصق قائمة IP هنا (مسافة، فاصلة، سطر جديد)",
    viewMode: "عرض",
    list: "قائمة",
    small: "مدمج",
    large: "بطاقة",
    modeAi: "توليد AI",
    modeWeb: "مصادر الويب",
    testSelected: "اختبار المحدد",
    appendResults: "دمج النتائج",
    portFilter: "تصفية المنفذ",
    source: "مصدر",
    platform: "منصة",
    clearHistory: "محو السجل",
    restore: "تحميل",
    githubRepo: "GitHub مستودع",
    actions: "أجراءات",
    selected: "المحدد",
    useWebSources: "تضمين مصادر الويب"
  }
};

const WEB_SOURCES = [
    { name: 'TheSpeedX SOCKS/HTTP', url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt' },
    { name: 'Monosans Proxy List', url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt' },
    { name: 'PrxChk HTTP List', url: 'https://raw.githubusercontent.com/prxchk/proxy-list/main/http.txt' },
    { name: 'Vakhov Fresh List', url: 'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt' }
];

const PROXY_APPS = [
    { name: 'v2rayNG', platforms: ['Android', 'Harmony'], desc: 'The standard V2Ray client for Android.', url: 'https://github.com/2dust/v2rayNG', color: 'emerald' },
    { name: 'NekoBox', platforms: ['Android', 'Windows'], desc: 'Powerful Sing-box based client with great UI.', url: 'https://github.com/MatsuriDayo/NekoBoxForAndroid', color: 'blue' },
    { name: 'Sing-box', platforms: ['All Platforms'], desc: 'Next-gen universal proxy platform.', url: 'https://github.com/SagerNet/sing-box', color: 'slate' },
    { name: 'Clash Verge', platforms: ['Win', 'Mac', 'Linux'], desc: 'Modern Clash GUI with Rev core.', url: 'https://github.com/clash-verge-rev/clash-verge-rev', color: 'indigo' },
    { name: 'Mihomo Party', platforms: ['Win', 'Mac', 'Linux'], desc: 'Beautiful, easy-to-use desktop client.', url: 'https://github.com/mihomo-party-org/mihomo-party', color: 'pink' },
    { name: 'Hiddify', platforms: ['All Platforms'], desc: 'Simple, unified client for all protocols.', url: 'https://github.com/hiddify/hiddify-next', color: 'orange' },
    { name: 'Karing', platforms: ['iOS', 'Mac', 'Win'], desc: 'Simple utility, supports Harmony via Next.', url: 'https://github.com/KaringX/karing', color: 'cyan' },
    { name: 'Shadowrocket', platforms: ['iOS', 'iPadOS'], desc: 'The essential tool for iOS users (Paid).', url: 'https://apps.apple.com/us/app/shadowrocket/id932747118', color: 'violet' },
];

const IDLE_RECOMMENDATIONS: ProxyNode[] = [
    { ip: '1.1.1.1', port: 443, protocol: 'HTTPS', countryCode: 'CLD', score: 98, latency: 12, speed: 25, anonymity: 'Elite', location: 'Cloudflare', source: 'Optimized' },
    { ip: '8.8.8.8', port: 443, protocol: 'HTTPS', countryCode: 'USA', score: 95, latency: 24, speed: 18, anonymity: 'Elite', location: 'Google', source: 'Optimized' },
    { ip: '104.16.132.229', port: 80, protocol: 'HTTP', countryCode: 'CLD', score: 92, latency: 45, speed: 15, anonymity: 'Anonymous', location: 'Cloudflare', source: 'Optimized' },
    { ip: '185.199.108.153', port: 443, protocol: 'HTTPS', countryCode: 'NLD', score: 89, latency: 65, speed: 12, anonymity: 'Elite', location: 'GitHub', source: 'Optimized' },
    { ip: '20.205.243.166', port: 80, protocol: 'HTTP', countryCode: 'SGP', score: 88, latency: 120, speed: 8, anonymity: 'Transparent', location: 'Microsoft', source: 'Optimized' },
    { ip: '142.250.180.14', port: 443, protocol: 'HTTPS', countryCode: 'FRA', score: 85, latency: 110, speed: 10, anonymity: 'Elite', location: 'Google', source: 'Optimized' },
    { ip: '203.119.128.0', port: 8080, protocol: 'HTTP', countryCode: 'HKG', score: 82, latency: 150, speed: 5, anonymity: 'Anonymous', location: 'CN2', source: 'Optimized' },
    { ip: '163.44.17.1', port: 80, protocol: 'HTTP', countryCode: 'JPN', score: 80, latency: 180, speed: 4, anonymity: 'Transparent', location: 'BBTEC', source: 'Optimized' },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [proxies, setProxies] = useState<ProxyNode[]>([]);
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // App States
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [lang, setLang] = useState<Language>('CN');
  const [viewMode, setViewMode] = useState<ViewMode>('grid_small');
  const [searchTab, setSearchTab] = useState<'auto' | 'custom' | 'apps'>('auto');
  const [appendMode, setAppendMode] = useState(true);
  
  // Result Selection State
  const [selectedResultKeys, setSelectedResultKeys] = useState<Set<string>>(new Set());
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  // Dashboard State
  const [localIp, setLocalIp] = useState<string>('Scanning...');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Inputs
  const [customInput, setCustomInput] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [reportUrl, setReportUrl] = useState<string>('');
  const [reportToken, setReportToken] = useState<string>('');

  // Search Params State (Auto)
  const [region, setRegion] = useState<Region>('Europe');
  const [country, setCountry] = useState<string>('All');
  const [portType, setPortType] = useState<PortType>('HTTPS'); // Default HTTPS
  const [customPort, setCustomPort] = useState<string>('');
  const [ipVersion, setIpVersion] = useState<'IPv4'|'IPv6'|'Any'>('IPv4');
  const [count, setCount] = useState<number>(20); 
  const [selectedWebSources, setSelectedWebSources] = useState<Set<string>>(new Set());

  // Filters
  const [filterPort, setFilterPort] = useState<string>('All');
  const [filterAnonymity, setFilterAnonymity] = useState<'All' | 'High' | 'Transparent'>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');

  // Time and IP Effects
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => setLocalIp(data.ip))
        .catch(() => setLocalIp('Offline'));

    return () => clearInterval(timer);
  }, []);

  // Text Helper
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'AR';

  const saveToHistory = (newProxies: ProxyNode[], params: SearchParams, newSources: any[]) => {
     const newItem: SearchHistory = {
       id: crypto.randomUUID(),
       timestamp: Date.now(),
       params,
       nodes: newProxies,
       sources: newSources
     };
     setHistory(prev => [newItem, ...prev].slice(0, 20));
  };

  const toggleHistorySelection = (id: string) => {
      const newSet = new Set(selectedHistoryIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedHistoryIds(newSet);
      
      // Merge selected proxies
      if (newSet.size > 0) {
          const allNodes: ProxyNode[] = [];
          const allSources: any[] = [];
          history.forEach(h => {
              if (newSet.has(h.id)) {
                  allNodes.push(...h.nodes);
                  allSources.push(...h.sources);
              }
          });
          // Deduplicate by IP:Port
          const uniqueNodes = Array.from(new Map(allNodes.map(item => [`${item.ip}:${item.port}`, item])).values());
          setProxies(uniqueNodes);
          setSources(allSources);
          setStatus(AppStatus.COMPLETE);
      } else {
          if (status !== AppStatus.SEARCHING && status !== AppStatus.ANALYZING) {
               setStatus(AppStatus.COMPLETE);
               setProxies([]);
          }
      }
  };

  const toggleAllHistory = () => {
      if (selectedHistoryIds.size === history.length) {
          setSelectedHistoryIds(new Set());
          setProxies([]);
          setStatus(AppStatus.COMPLETE);
      } else {
          const allIds = new Set(history.map(h => h.id));
          setSelectedHistoryIds(allIds);
          const allNodes: ProxyNode[] = [];
          history.forEach(h => allNodes.push(...h.nodes));
          const uniqueNodes = Array.from(new Map(allNodes.map(item => [`${item.ip}:${item.port}`, item])).values());
          setProxies(uniqueNodes);
          setStatus(AppStatus.COMPLETE);
      }
  };

  const loadSingleHistory = (h: SearchHistory) => {
      setProxies(h.nodes);
      setSources(h.sources);
      setSelectedHistoryIds(new Set([h.id]));
      setStatus(AppStatus.COMPLETE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Result Selection Logic
  const toggleResultSelection = (key: string) => {
      const newSet = new Set(selectedResultKeys);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      setSelectedResultKeys(newSet);
  };
  
  const getTargetProxies = () => {
      if (selectedResultKeys.size > 0) {
          return filteredProxies.filter(p => selectedResultKeys.has(`${p.ip}:${p.port}`));
      }
      return filteredProxies;
  };

  const parseCustomInput = (input: string, defaultPort: string): ProxyNode[] => {
    const lines = input.split(/[\r\n\s,]+/).map(l => l.trim()).filter(l => l);
    const nodes: ProxyNode[] = [];
    const ipv4Regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d{1,5}))?$/;
    
    lines.forEach(line => {
        let tag = 'Custom';
        let cleanLine = line;
        if (line.includes('#')) {
            const parts = line.split('#');
            cleanLine = parts[0].trim();
            tag = parts[1]?.trim() || 'Custom';
        }
        
        let ip = cleanLine;
        let port = defaultPort || (portType === 'HTTPS' ? '443' : '80');
        let isIPv6 = false;

        const bracketMatch = cleanLine.match(/^\[([a-fA-F0-9:]+)\](?::(\d+))?$/);
        if (bracketMatch) {
            ip = bracketMatch[1];
            if (bracketMatch[2]) port = bracketMatch[2];
            isIPv6 = true;
        } else {
             if (cleanLine.includes('.') && cleanLine.includes(':')) {
                 const lastColon = cleanLine.lastIndexOf(':');
                 ip = cleanLine.substring(0, lastColon);
                 port = cleanLine.substring(lastColon + 1);
             } 
             else if (cleanLine.includes(':') && !cleanLine.includes('.')) {
                 isIPv6 = true;
                 ip = cleanLine; 
             }
             else if (ipv4Regex.test(cleanLine)) {
                 const match = ipv4Regex.exec(cleanLine);
                 if (match) {
                     ip = match[1];
                     port = match[2] || port;
                 }
             }
        }
        
        if (ip) {
            nodes.push({
                ip,
                port,
                protocol: portType === 'HTTPS' ? 'HTTPS' : 'HTTP',
                location: tag,
                countryCode: tag === 'Custom' ? 'UNK' : tag.substring(0, 3).toUpperCase(),
                ipVersion: isIPv6 || ip.includes(':') ? 'IPv6' : 'IPv4',
                source: 'Custom Paste'
            });
        }
    });
    return nodes;
  };

  const handleSearch = async () => {
    if (searchTab === 'auto' && count < 5 && selectedWebSources.size === 0) {
        setError(lang === 'CN' ? "AI数量最少 5 个" : "Minimum count is 5");
        return;
    }

    setStatus(AppStatus.SEARCHING);
    setError(null);
    if (!appendMode) {
        setProxies([]);
        setSources([]);
    }
    
    if (!appendMode) {
        setSelectedHistoryIds(new Set());
        setSelectedResultKeys(new Set());
    }
    
    setFilterPort('All');
    setFilterAnonymity('All');
    setFilterRegion('All');

    const params: SearchParams = {
        region,
        country: country === 'All' ? '' : country,
        port: customPort,
        portType,
        ipVersion,
        count
    };

    try {
      let rawProxies: ProxyNode[] = [];
      let searchSources: any[] = [];

      if (searchTab === 'auto') {
          const tasks = [];
          
          // AI Search Task
          const runAi = count > 0;
          if (runAi) {
              tasks.push(findProxies(params).then(res => ({
                  type: 'ai',
                  proxies: res.proxies.map(p => ({...p, source: 'AI Auto'})),
                  sources: res.sources
              })));
          }
          
          // Web Sources Task
          if (selectedWebSources.size > 0) {
              const urls = Array.from(selectedWebSources);
              tasks.push(fetchPublicProxies(urls).then(res => ({
                  type: 'web',
                  proxies: res.proxies.map(p => ({...p, source: 'Web Scan'})),
                  sources: res.sources
              })));
          }
          
          const results = await Promise.all(tasks);
          results.forEach(r => {
              rawProxies.push(...r.proxies);
              searchSources.push(...r.sources);
          });

          if (rawProxies.length === 0) throw new Error("No proxies found. Try different settings.");

      } else if (searchTab === 'custom') {
         rawProxies = parseCustomInput(customInput, customPort);
         if (rawProxies.length === 0) throw new Error("No valid IPs found in input");
         searchSources = [{ title: 'User Custom Input', uri: '#' }];
      }

      setStatus(AppStatus.ANALYZING);
      const analyzedProxies = await performSpeedTest(rawProxies, portType);
      
      setProxies(prev => {
          if (appendMode) {
              const combined = [...prev, ...analyzedProxies];
              const unique = Array.from(new Map(combined.map(item => [`${item.ip}:${item.port}`, item])).values());
              return unique;
          }
          return analyzedProxies;
      });

      setStatus(AppStatus.COMPLETE);
      saveToHistory(analyzedProxies, params, searchSources);
      
      setSources(prev => {
         if (appendMode) {
             const combined = [...prev, ...searchSources];
             return Array.from(new Map(combined.map(item => [item.uri, item])).values());
         }
         return searchSources;
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error occurred.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleExportCSV = () => {
    const target = getTargetProxies();
    if (target.length === 0) return;

    const sortedProxies = [...target].sort((a, b) => Number(a.port) - Number(b.port));
    const headers = ['IP', 'Port', 'Protocol', 'Country', 'Source', 'Speed(MB/s)', 'Latency(ms)', 'Score', 'Anonymity'];
    const rows = sortedProxies.map(p => [
        p.ip, p.port, p.protocol, p.countryCode || 'UNK', p.source || 'Auto',
        p.speed || 0, p.latency, p.score, p.anonymity
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proxy_scout_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    setShowActionDropdown(false);
  };

  const handleReport = async () => {
      if (!reportUrl) { setShowReportModal(true); return; }
      const target = getTargetProxies();
      if (target.length === 0) return;

      try {
          const payload = {
              timestamp: Date.now(),
              region,
              count: target.length,
              nodes: target
          };
          const res = await fetch(reportUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  ...(reportToken ? { 'Authorization': `Bearer ${reportToken}` } : {})
              },
              body: JSON.stringify(payload)
          });
          if (res.ok) alert(t.reportSuccess);
          else throw new Error(res.statusText);
      } catch (e) {
          alert(`${t.reportFail}: ${e}`);
          setShowReportModal(true); 
      }
  };

  const handleCopyAll = () => {
      const target = getTargetProxies();
      if (target.length === 0) return;
      const text = target.map(p => `${p.ip}:${p.port}`).join('\n');
      navigator.clipboard.writeText(text);
      setShowActionDropdown(false);
  };

  const availablePorts = useMemo(() => {
      const ports = new Set(proxies.map(p => String(p.port)));
      return Array.from(ports).sort((a,b) => Number(a) - Number(b));
  }, [proxies]);

  const filteredProxies = useMemo(() => {
      let result = proxies;
      if (filterPort !== 'All') result = result.filter(p => String(p.port) === filterPort);
      if (filterAnonymity === 'High') result = result.filter(p => p.anonymity === 'Elite' || p.anonymity === 'Anonymous');
      else if (filterAnonymity === 'Transparent') result = result.filter(p => p.anonymity !== 'Elite' && p.anonymity !== 'Anonymous');
      
      if (filterRegion !== 'All') {
          if (filterRegion === 'Americas') result = result.filter(p => ['USA','CAN','BRA','MEX','ARG'].includes(p.countryCode || ''));
          else if (filterRegion === 'Europe') result = result.filter(p => ['DEU','GBR','NLD','FRA','RUS','ITA','ESP'].includes(p.countryCode || ''));
          else if (filterRegion === 'Asia') result = result.filter(p => ['CHN','HKG','JPN','SGP','KOR','IND','VNM'].includes(p.countryCode || ''));
          else result = result.filter(p => p.location.includes(filterRegion));
      }
      return result.filter(p => (p.latency || 9999) <= 800);
  }, [proxies, filterPort, filterAnonymity, filterRegion]);

  const getCountryOptions = () => {
    if (region === 'Americas') return [{ val: 'All', label: 'All' }, { val: 'United States', label: 'USA' }, { val: 'Canada', label: 'Canada' }, { val: 'Brazil', label: 'Brazil' }];
    if (region === 'Europe') return [{ val: 'All', label: 'All' }, { val: 'Germany', label: 'Germany' }, { val: 'United Kingdom', label: 'UK' }, { val: 'Netherlands', label: 'Netherlands' }, { val: 'Russia', label: 'Russia' }];
    if (region === 'Asia') return [{ val: 'All', label: 'All' }, { val: 'Hong Kong', label: 'Hong Kong' }, { val: 'Japan', label: 'Japan' }, { val: 'Singapore', label: 'Singapore' }, { val: 'South Korea', label: 'Korea' }];
    if (region === 'All') return [{ val: 'All', label: 'Global / Cloudflare' }];
    return [{ val: 'All', label: 'All' }];
  }

  // Helper to get platform icon
  const getPlatformIcon = (platforms: string[]) => {
      if (platforms.includes('iOS')) return <Apple size={18} />;
      if (platforms.includes('Android')) return <Smartphone size={18} />;
      if (platforms.includes('Win')) return <Monitor size={18} />;
      return <AppWindow size={18} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Settings Modal */}
      {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-96 shadow-2xl">
                  <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><Settings2 size={18}/> {t.settings}</h3>
                  <input 
                    value={reportUrl} onChange={e => setReportUrl(e.target.value)} placeholder={t.apiUrlPlace}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-3 text-xs outline-none focus:border-emerald-500"
                  />
                  <input 
                    value={reportToken} onChange={e => setReportToken(e.target.value)} placeholder={t.tokenPlace}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-4 text-xs outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowReportModal(false)} className="px-3 py-1.5 text-xs bg-slate-800 rounded hover:bg-slate-700">Cancel</button>
                      <button onClick={() => { setShowReportModal(false); handleReport(); }} className="px-3 py-1.5 text-xs bg-emerald-600 rounded text-white hover:bg-emerald-500">Save & Send</button>
                  </div>
              </div>
          </div>
      )}

      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
                <Globe className="text-emerald-600" size={24} strokeWidth={1.5} />
                <Satellite className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} text-sky-400`} size={14} strokeWidth={2} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white hidden sm:block font-mono">
              Proxy IP <span className="text-emerald-500">Scout</span>
            </h1>
          </div>

          {/* Local IP and Time Dashboard */}
          <div className="hidden md:flex items-center gap-4 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800/80 mx-auto shadow-inner">
             <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${localIp === 'Offline' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                 <span className="text-[10px] font-mono text-slate-400"><Network size={10} className="inline mr-1"/>IP:</span>
                 <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider">{localIp}</span>
             </div>
             <div className="w-px h-3 bg-slate-700"></div>
             <div className="flex items-center gap-2">
                 <span className="text-[10px] font-mono text-slate-400"><Clock size={10} className="inline mr-1"/>TIME:</span>
                 <span className="text-xs font-mono text-slate-200 tracking-wider w-16">{currentTime.toLocaleTimeString([], {hour12: false})}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-900 rounded border border-slate-800 p-0.5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`} title={t.list}><List size={14}/></button>
                <button onClick={() => setViewMode('grid_small')} className={`p-1.5 rounded ${viewMode === 'grid_small' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`} title={t.small}><Grid3X3 size={14}/></button>
                <button onClick={() => setViewMode('grid_large')} className={`p-1.5 rounded ${viewMode === 'grid_large' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`} title={t.large}><LayoutGrid size={14}/></button>
             </div>

             <div className="flex bg-slate-900 rounded border border-slate-800 p-0.5">
                {(['CN', 'EN', 'AR'] as Language[]).map(l => (
                    <button key={l} onClick={() => setLang(l)} className={`px-2 py-0.5 text-[10px] font-bold rounded ${lang === l ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                        {l}
                    </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Source Tabs */}
        <div className="flex gap-4 border-b border-slate-800 mb-4 overflow-x-auto">
            <button onClick={() => setSearchTab('auto')} className={`pb-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${searchTab === 'auto' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <Database size={14}/> {t.sourceAuto}
            </button>
            <button onClick={() => setSearchTab('custom')} className={`pb-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${searchTab === 'custom' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <Terminal size={14}/> {t.sourceCustom}
            </button>
            <button onClick={() => setSearchTab('apps')} className={`pb-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${searchTab === 'apps' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <AppWindow size={14}/> {t.sourceApps}
            </button>
        </div>

        {/* Search Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 mb-6 shadow-lg backdrop-blur-sm min-h-[150px]">
            {searchTab === 'custom' ? (
                <div className="space-y-3 animate-in fade-in">
                    <textarea 
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder={t.pastePlaceholder}
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-3 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                    />
                     <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                           {appendMode ? <CheckSquare size={14} className="text-emerald-500"/> : <Square size={14} className="text-slate-500"/>}
                           <input type="checkbox" className="hidden" checked={appendMode} onChange={e => setAppendMode(e.target.checked)} />
                           <span className="text-xs text-slate-400 select-none">{t.appendResults}</span>
                        </label>

                        <button 
                            onClick={handleSearch}
                            disabled={status === AppStatus.SEARCHING || status === AppStatus.ANALYZING || !customInput.trim()}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                        >
                            {status === AppStatus.ANALYZING ? <Activity size={14} className="animate-pulse" /> : <Search size={14} />}
                            {status === AppStatus.ANALYZING ? t.testing : t.search}
                        </button>
                    </div>
                </div>
            ) : searchTab === 'apps' ? (
                <div className="animate-in fade-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {PROXY_APPS.map(app => (
                        <div key={app.name} className={`bg-slate-950 border border-slate-800 rounded p-3 hover:border-${app.color}-500/50 transition-all group flex flex-col h-full`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className={`w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-${app.color}-500 border border-slate-800`}>
                                    {getPlatformIcon(app.platforms)}
                                </div>
                                <a href={app.url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-500 hover:text-emerald-400 rounded hover:bg-slate-900 transition-colors">
                                    <ExternalLink size={14}/>
                                </a>
                            </div>
                            
                            <h4 className="text-sm font-bold text-slate-200 group-hover:text-white truncate mb-1">{app.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 flex-1">{app.desc}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-auto">
                                {app.platforms.map(p => (
                                    <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end mb-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.region}</label>
                            <select value={region} onChange={(e) => { setRegion(e.target.value as Region); setCountry('All'); }} className="w-full bg-slate-950 border border-slate-700 rounded py-1.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200">
                                <option value="Americas">Americas</option>
                                <option value="Europe">Europe</option>
                                <option value="Asia">Asia</option>
                                <option value="All">All (Cloudflare)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.country}</label>
                            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded py-1.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200">
                                {getCountryOptions().map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.ipVersion}</label>
                            <div className="flex bg-slate-950 rounded border border-slate-700 p-0.5">
                                {(['IPv4', 'IPv6', 'Any'] as const).map((v) => (
                                    <button key={v} onClick={() => setIpVersion(v)} className={`flex-1 py-1 text-[10px] rounded font-medium transition-all ${ipVersion === v ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{v}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.portMode}</label>
                            <select value={portType} onChange={(e) => setPortType(e.target.value as PortType)} className="w-full bg-slate-950 border border-slate-700 rounded py-1.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200">
                                <option value="HTTPS">HTTPS</option>
                                <option value="HTTP">HTTP</option>
                                <option value="Custom">{t.custom}</option>
                            </select>
                            {portType === 'Custom' && <input type="text" placeholder="8080" value={customPort} onChange={(e) => setCustomPort(e.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded py-1.5 px-2 text-xs outline-none text-slate-200"/>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.count}</label>
                            <input type="number" min={0} max={100} value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded py-1.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200"/>
                        </div>
                        <div className="h-full flex items-end gap-2">
                            <label className="h-[30px] flex items-center px-2 bg-slate-950 border border-slate-700 rounded cursor-pointer hover:border-slate-500 transition-colors" title={t.appendResults}>
                                    {appendMode ? <PlusCircle size={14} className="text-emerald-500"/> : <PlusCircle size={14} className="text-slate-600"/>}
                                    <input type="checkbox" className="hidden" checked={appendMode} onChange={e => setAppendMode(e.target.checked)} />
                            </label>

                            <button 
                                onClick={handleSearch}
                                disabled={status === AppStatus.SEARCHING || status === AppStatus.ANALYZING}
                                className="flex-1 h-[30px] bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-emerald-900/20"
                            >
                                {status === AppStatus.SEARCHING ? <RefreshCw className="animate-spin" size={14} /> : status === AppStatus.ANALYZING ? <Activity size={14} className="animate-pulse" /> : <Search size={14} />}
                                {status === AppStatus.SEARCHING ? t.scanning : status === AppStatus.ANALYZING ? t.testing : t.search}
                            </button>
                        </div>
                    </div>
                    
                    {/* Web Sources Integration */}
                    <div className="border-t border-slate-800 pt-3">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] font-bold text-slate-500 uppercase">{t.useWebSources}</span>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                               {WEB_SOURCES.map(ws => (
                                   <div key={ws.name} 
                                        onClick={() => {
                                            const newSet = new Set(selectedWebSources);
                                            if (newSet.has(ws.url)) newSet.delete(ws.url);
                                            else newSet.add(ws.url);
                                            setSelectedWebSources(newSet);
                                        }}
                                        className={`
                                            cursor-pointer border rounded p-2 flex items-center justify-between transition-all select-none hover:bg-slate-800/50
                                            ${selectedWebSources.has(ws.url) ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}
                                        `}
                                   >
                                       <span className="text-[10px] font-medium text-slate-300 truncate">{ws.name}</span>
                                       {selectedWebSources.has(ws.url) ? <CheckSquare size={12} className="text-emerald-500"/> : <Square size={12} className="text-slate-600"/>}
                                   </div>
                               ))}
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* States */}
        {status === AppStatus.ANALYZING && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                 <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl text-center max-w-xs">
                     <div className="w-12 h-12 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-3">
                         <RefreshCw className="animate-spin text-emerald-500" size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-white mb-1">{t.analyzing}</h3>
                     <p className="text-slate-400 text-xs">{t.analyzingDesc}</p>
                 </div>
             </div>
        )}

        {status === AppStatus.IDLE && searchTab !== 'apps' && (
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-slate-900/10 animate-in fade-in">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-3 border border-slate-800 shadow-lg relative">
              <Globe size={24} className="text-emerald-600" />
              <Satellite className="absolute -top-1 -right-1 text-sky-400" size={14} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">{t.idleTitle}</h2>
            <p className="text-slate-500 text-xs max-w-sm mb-8">{t.idleDesc}</p>
            
            {/* Idle Marquee / Grid */}
            <div className="w-full max-w-5xl px-4">
                 <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <Zap size={10}/> Random High-Speed Nodes
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 opacity-60 hover:opacity-100 transition-opacity">
                     {IDLE_RECOMMENDATIONS.map((proxy, i) => (
                         <div key={i} className="pointer-events-none grayscale hover:grayscale-0 transition-all">
                             <ProxyCard 
                                proxy={proxy} lang={lang} viewMode="grid_small" 
                             />
                         </div>
                     ))}
                 </div>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 p-3 rounded text-sm flex items-center gap-3 mb-6">
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        {/* Results */}
        {(status === AppStatus.COMPLETE || filteredProxies.length > 0) && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase hidden md:block">{t.type}:</span>
                        <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
                           <button onClick={() => setFilterAnonymity('All')} className={`px-2 py-0.5 text-[10px] rounded ${filterAnonymity === 'All' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{t.all}</button>
                           <button onClick={() => setFilterAnonymity('High')} className={`px-2 py-0.5 text-[10px] rounded ${filterAnonymity === 'High' ? 'bg-emerald-900/30 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>{t.high}</button>
                           <button onClick={() => setFilterAnonymity('Transparent')} className={`px-2 py-0.5 text-[10px] rounded ${filterAnonymity === 'Transparent' ? 'bg-amber-900/30 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>{t.transparent}</button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                         {/* Dynamic Port Filter */}
                         <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5">
                            <Filter size={10} className="text-slate-500"/>
                            <select value={filterPort} onChange={(e) => setFilterPort(e.target.value)} className="bg-transparent text-[10px] text-slate-200 outline-none border-none min-w-[60px]">
                                <option value="All">{t.allPorts}</option>
                                {availablePorts.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                         </div>

                         <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] text-slate-200 rounded px-2 py-1 outline-none">
                            <option value="All">{t.allRegions}</option>
                            <option value="Americas">Americas</option>
                            <option value="Europe">Europe</option>
                            <option value="Asia">Asia</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end flex-wrap">
                    <div 
                         className="relative"
                         onMouseEnter={() => setShowHistoryDropdown(true)}
                         onMouseLeave={() => setShowHistoryDropdown(false)}
                    >
                         <div className="flex rounded bg-slate-800 border border-slate-700 p-0.5">
                            <button className="px-2 py-1 text-slate-300 hover:text-white text-[10px] flex items-center gap-1">
                               <History size={12} /> {t.history}
                            </button>
                            <div className="w-px bg-slate-700 mx-1"></div>
                            <button onClick={toggleAllHistory} className={`px-2 py-1 text-[10px] flex items-center gap-1 ${selectedHistoryIds.size === history.length && history.length > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}>
                               {t.showAll}
                            </button>
                         </div>
                        {showHistoryDropdown && (
                             <div className={`absolute top-full mt-1 w-72 bg-slate-900 border border-slate-800 rounded shadow-xl p-1 z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                                 {history.length === 0 ? (
                                     <div className="p-2 text-[10px] text-slate-500 text-center">Empty</div>
                                 ) : (
                                     history.map(h => (
                                        <div key={h.id} className="flex items-center gap-2 hover:bg-slate-800 px-2 py-1.5 rounded">
                                            <button onClick={() => toggleHistorySelection(h.id)} className="text-slate-400 hover:text-emerald-500">
                                                {selectedHistoryIds.has(h.id) ? <CheckSquare size={14} className="text-emerald-500"/> : <Square size={14}/>}
                                            </button>
                                            <div className="flex-1 text-[10px] text-slate-300 flex justify-between cursor-pointer" onClick={() => toggleHistorySelection(h.id)}>
                                                <div className="flex flex-col w-full">
                                                    <div className="flex justify-between items-center">
                                                         <span className="truncate font-bold text-emerald-500">{h.nodes[0]?.source || 'Scan'}</span>
                                                         <span className="text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-500 text-[9px]">
                                                        <span>{h.params.region}</span>
                                                        <span>Count: {h.nodes.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                     ))
                                 )}
                             </div>
                        )}
                    </div>
                    <button onClick={handleReport} className="px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-900/50 rounded text-[10px] font-medium flex items-center gap-1.5 transition-all active:scale-95"><CloudUpload size={12} /> {t.report}</button>
                    
                    {/* Merged Actions Dropdown */}
                    <div className="relative">
                        <button onClick={() => setShowActionDropdown(!showActionDropdown)} className="px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50 rounded text-[10px] font-medium flex items-center gap-1.5 transition-all active:scale-95">
                             <MoreVertical size={12} /> {t.actions} {selectedResultKeys.size > 0 && `(${selectedResultKeys.size})`}
                        </button>
                        {showActionDropdown && (
                            <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded shadow-xl z-50 flex flex-col">
                                <button onClick={handleCopyAll} className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 text-left flex items-center gap-2">
                                    <Copy size={12}/> {t.copyAll} {selectedResultKeys.size > 0 ? t.selected : ''}
                                </button>
                                <button onClick={handleExportCSV} className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 text-left flex items-center gap-2 border-t border-slate-800">
                                    <FileSpreadsheet size={12}/> {t.exportCSV} {selectedResultKeys.size > 0 ? t.selected : ''}
                                </button>
                            </div>
                        )}
                        {showActionDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowActionDropdown(false)}></div>}
                    </div>
                </div>
            </div>
            
            {/* Proxy Grid */}
            <div className={`
                grid gap-2 
                ${viewMode === 'list' ? 'grid-cols-1' : ''}
                ${viewMode === 'grid_small' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : ''}
                ${viewMode === 'grid_large' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
            `}>
               {filteredProxies.map((proxy, idx) => {
                   const key = `${proxy.ip}:${proxy.port}`;
                   return (
                       <ProxyCard 
                           key={`${key}-${idx}`} 
                           proxy={proxy} 
                           lang={lang} 
                           viewMode={viewMode} 
                           selected={selectedResultKeys.has(key)}
                           onToggleSelect={() => toggleResultSelection(key)}
                       />
                   );
               })}
            </div>

            {filteredProxies.length === 0 && status === AppStatus.COMPLETE && (
                <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/30 rounded border border-dashed border-slate-800">
                    {t.noProxies}
                </div>
            )}
          </div>
        )}

        {/* Persistent History Section at Bottom */}
        <div className="mt-12 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><History size={16}/> {t.history}</h3>
                {history.length > 0 && (
                    <button onClick={() => setHistory([])} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                        <Trash2 size={10} /> {t.clearHistory}
                    </button>
                )}
            </div>
            
            {history.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-xs">{t.noProxies}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {history.map(h => (
                        <div key={h.id} className="bg-slate-900/50 border border-slate-800 rounded p-3 flex justify-between items-center group hover:border-slate-600 transition-all">
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold text-xs truncate">{h.nodes[0]?.source || 'Manual Scan'}</span>
                                    <span className="text-slate-500 text-[10px] bg-slate-950 px-1.5 rounded">{h.nodes.length} items</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span>{new Date(h.timestamp).toLocaleString()}</span>
                                    <span className="w-px h-3 bg-slate-700"></span>
                                    <span className="truncate max-w-[120px]">{h.params.region}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => loadSingleHistory(h)}
                                className="p-2 bg-emerald-900/20 text-emerald-400 rounded hover:bg-emerald-900/40 hover:text-emerald-300 transition-colors"
                                title={t.restore}
                            >
                                <Download size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* GitHub Footer */}
        <footer className="mt-12 py-6 text-center border-t border-slate-800/50">
             <a href="https://github.com/chujianchangan?tab=repositories" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors text-xs font-bold">
                 <Github size={14} />
                 {t.githubRepo}
             </a>
        </footer>

      </main>
    </div>
  );
};

export default App;
