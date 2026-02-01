'use client';

import { useState, useEffect } from 'react';
import { Hash, Volume2, ChevronDown, Loader2, Folder } from 'lucide-react';

export default function ChannelSelector({ guildId, value, onChange, placeholder = "Selecciona un canal", type = "text" }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!guildId) return;

    fetch(`/api/v1/guilds/${guildId}/channels`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter based on requested type
          const filtered = data.filter(c => {
            if (type === 'category') return c.type === 4;
            if (type === 'voice') return c.type === 2;
            return c.type === 0 || c.type === 5;
          });
          setChannels(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load channels', err);
        setLoading(false);
      });
  }, [guildId, type]);

  const selectedChannel = channels.find(c => c.id === value);

  const getIcon = () => {
    if (type === 'category') return <Folder className="text-gray-400 shrink-0" size={16} />;
    if (type === 'voice') return <Volume2 className="text-gray-400 shrink-0" size={16} />;
    return <Hash className="text-gray-400 shrink-0" size={16} />;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm transition-colors focus:outline-none focus:border-purple-500 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black/70'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {loading ? (
            <Loader2 className="animate-spin text-gray-400" size={16} />
          ) : selectedChannel ? (
            <>
              {getIcon()}
              <span className="text-white truncate">{selectedChannel.name}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-black/20 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-fade-in-up">
          {channels.length > 0 ? (
            <div className="p-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => {
                    onChange(channel.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
                    value === channel.id 
                      ? 'bg-purple-600/20 text-white' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {type === 'category' ? <Folder className="text-gray-500 shrink-0" size={16} /> : 
                   type === 'voice' ? <Volume2 className="text-gray-500 shrink-0" size={16} /> :
                   <Hash className="text-gray-500 shrink-0" size={16} />}
                  <span className="truncate">{channel.name}</span>
                  {value === channel.id && <span className="ml-auto text-purple-400 text-xs">●</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron {type === 'category' ? 'categorías' : type === 'voice' ? 'canales de voz' : 'canales'}.
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
