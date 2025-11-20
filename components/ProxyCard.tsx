
import React from 'react';
import { ProxyNode, Language, ViewMode } from '../types';
import { CheckSquare, Square } from 'lucide-react';

interface Props {
  proxy: ProxyNode;
  lang: Language;
  viewMode: ViewMode;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export const ProxyCard: React.FC<Props> = ({ proxy, lang, viewMode, selected, onToggleSelect }) => {
  const isLive = (proxy.latency || 9999) < 1000;
  const score = proxy.score || 0;
  
  // Score Color Logic
  let scoreColor = 'text-red-400';
  if (score > 85) scoreColor = 'text-emerald-400';
  else if (score > 60) scoreColor = 'text-amber-400';

  const copyToClipboard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const str = `${proxy.ip}:${proxy.port}`;
    navigator.clipboard.writeText(str);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) onToggleSelect();
  };

  const getAnonymityLabel = (anon: string | undefined) => {
    if (lang === 'CN') return anon === 'Elite' ? '高匿' : anon === 'Anonymous' ? '匿名' : '透明';
    if (lang === 'AR') return anon === 'Elite' ? 'نخبة' : anon === 'Anonymous' ? 'مجهول' : 'شفاف';
    return anon || 'Trans';
  };

  // Use full 3-letter code if available, or full string if short, else standard fallback
  const displayCountry = proxy.countryCode && proxy.countryCode !== 'UNK' ? proxy.countryCode : 'UN';

  // Dynamic styles based on selection
  const containerBase = "cursor-pointer transition-all group relative";
  const selectedStyle = selected 
    ? 'bg-emerald-900/20 border-emerald-500' 
    : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80';

  // Compact Grid / Small View
  if (viewMode === 'grid_small') {
    return (
      <div 
        onClick={copyToClipboard}
        className={`${containerBase} border rounded p-1.5 select-none ${selectedStyle}`}
      >
         {onToggleSelect && (
             <div onClick={handleToggle} className={`absolute top-0.5 right-0.5 z-10 p-1 ${!selected ? 'opacity-0 group-hover:opacity-100' : ''}`}>
                 {selected ? <CheckSquare size={12} className="text-emerald-500"/> : <Square size={12} className="text-slate-500"/>}
             </div>
         )}
         <div className="flex justify-between items-center mb-1 leading-none">
            <div className="font-mono text-[10px] text-slate-200 font-bold truncate w-full pr-3" title={`${proxy.ip}:${proxy.port}`}>
              {proxy.ip}<span className="text-emerald-500">:{proxy.port}</span>
            </div>
         </div>
  
         <div className="flex items-center justify-between text-[9px] leading-none">
            <div className="flex items-center gap-1">
               <span className={`${isLive ? 'text-emerald-400' : 'text-red-400'} font-medium`}>{proxy.latency}ms</span>
               {proxy.speed !== undefined && proxy.speed > 0 && <span className="text-blue-400 hidden sm:inline">{proxy.speed}M</span>}
            </div>
            <div className="flex items-center gap-1">
               <span className="font-mono font-bold text-slate-400 uppercase tracking-tighter">{displayCountry}</span>
            </div>
         </div>
      </div>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div 
        onClick={copyToClipboard}
        className={`${containerBase} border rounded px-3 py-2 flex items-center justify-between ${selectedStyle} bg-slate-900/60`}
      >
         <div className="flex items-center gap-4 w-1/3">
            <div className="flex items-center gap-2">
               {onToggleSelect && (
                   <div onClick={handleToggle} className="text-slate-500 hover:text-emerald-400">
                      {selected ? <CheckSquare size={16} className="text-emerald-500"/> : <Square size={16}/>}
                   </div>
               )}
                <div className="flex items-center gap-2 min-w-[60px]">
                    <span className="text-lg">{proxy.flag || '🏳️'}</span>
                    <span className="font-mono font-bold text-slate-400 text-xs">{displayCountry}</span>
                </div>
            </div>
            <div className="font-mono text-sm text-slate-200 font-bold truncate">
              {proxy.ip}<span className="text-emerald-500">:{proxy.port}</span>
            </div>
         </div>

         <div className="flex items-center gap-6 w-1/3 justify-center">
            <span className={`font-mono text-xs ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>{proxy.latency}ms</span>
            <span className="font-mono text-xs text-blue-400">{proxy.speed} MB/s</span>
            <span className={`text-xs font-bold ${scoreColor}`}>{score} pts</span>
         </div>

         <div className="flex items-center gap-4 w-1/3 justify-end">
            <span className="text-xs text-slate-500 uppercase">{proxy.protocol}</span>
            <span className={`text-xs ${proxy.anonymity === 'Elite' ? 'text-purple-400' : 'text-slate-500'}`}>
                {getAnonymityLabel(proxy.anonymity)}
             </span>
         </div>
      </div>
    );
  }

  // Large Grid (Default Card Style)
  return (
    <div 
      onClick={copyToClipboard}
      className={`${containerBase} border rounded p-3 flex flex-col gap-2 ${selectedStyle}`}
    >
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 w-3/4">
            {onToggleSelect && (
                <div onClick={handleToggle} className={`text-slate-500 hover:text-emerald-400 ${!selected ? 'opacity-50 group-hover:opacity-100' : ''}`}>
                   {selected ? <CheckSquare size={14} className="text-emerald-500"/> : <Square size={14}/>}
                </div>
            )}
            <div className="font-mono text-xs text-slate-200 font-bold truncate" title={proxy.ip}>
               {proxy.ip}
            </div>
          </div>
          {proxy.speed !== undefined && proxy.speed > 0 && (
              <span className="text-blue-400 font-bold text-[10px] whitespace-nowrap">{proxy.speed} M/s</span>
          )}
       </div>

       {/* Row 2: Port and Latency */}
       <div className="flex justify-between items-center pl-5">
          <div className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
             <span className="text-emerald-500 font-mono font-bold text-xs">:{proxy.port}</span>
          </div>
          <span className={`font-bold text-xs ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>
             {proxy.latency}ms
          </span>
       </div>

       {/* Row 3: Footer Info */}
       <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/50 pt-2 mt-1">
          <div className="flex items-center gap-2">
             <span className={`${proxy.anonymity === 'Elite' ? 'text-purple-400' : 'text-slate-500'}`}>
                {getAnonymityLabel(proxy.anonymity)}
             </span>
             <span className="uppercase text-slate-500 font-mono">
                {proxy.protocol}
             </span>
          </div>

          <div className="flex items-center gap-1">
             <span className="font-mono font-bold text-slate-300 text-xs">{displayCountry}</span>
             <span className="text-sm leading-none">{proxy.flag || '🏳️'}</span>
          </div>
       </div>
    </div>
  );
};
