'use client';

import { useState } from 'react';
import { ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ModuleCard({ 
  icon, 
  color, 
  bgColor, 
  title, 
  description, 
  moduleName, 
  guildId, 
  initialEnabled, 
  isPlaceholder = false 
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e) => {
    e.preventDefault();
    if (isPlaceholder || loading) return;

    setLoading(true);
    const newState = !enabled;

    try {
      const res = await fetch(`/api/v1/modules/${moduleName}/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState }),
      });

      if (res.ok) {
        setEnabled(newState);
        router.refresh(); 
      }
    } catch (error) {
      console.error('Failed to toggle module', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group ${!enabled && !isPlaceholder ? 'opacity-80' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${enabled ? 'bg-green-500/10 text-green-400' : (bgColor + ' ' + color)} transition-colors`}>
            {icon}
          </div>
          {!isPlaceholder && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${enabled ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-gray-500/10'}`}>
                {enabled ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={handleToggle} disabled={loading} className="focus:outline-none hover:scale-110 transition-transform cursor-pointer">
                {loading ? (
                  <Loader2 className="animate-spin text-gray-500" size={24} />
                ) : enabled ? (
                  <ToggleRight className="text-green-500" size={24} />
                ) : (
                  <ToggleLeft className="text-gray-500" size={24} />
                )}
              </button>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
          {description}
        </p>
        
        {isPlaceholder ? (
          <button className="block w-full py-2.5 bg-white/5 hover:bg-white/10 text-center rounded-lg font-medium text-sm transition-colors cursor-not-allowed">
            Próximamente
          </button>
        ) : (
          <Link 
            href={`/dashboard/servers/${guildId}/${moduleName}`}
            className="block w-full py-2.5 bg-white/10 hover:bg-white/20 text-center rounded-lg font-medium text-sm transition-colors"
          >
            Configurar
          </Link>
        )}
      </div>
    </div>
  );
}
