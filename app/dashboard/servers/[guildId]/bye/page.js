'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import MessageEditor from '@/app/dashboard/components/MessageEditor';
import ChannelSelector from '@/app/dashboard/components/ChannelSelector';

export default function ByeModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/modules/bye/${guildId}`)
      .then(res => {
        if (res.status === 401) window.location.href = '/dashboard';
        return res.json();
      })
      .then(data => {
        // Ensure message structure is correct
        if (!data.message || typeof data.message === 'string') {
          data.message = {
            content: typeof data.message === 'string' ? data.message : '',
            embeds: []
          };
        }
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [guildId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/modules/bye/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      // Optional: Show success toast
    } catch (error) {
      console.error(error);
      // Optional: Show error toast
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleMessageChange = (newMessageData) => {
    setSettings(prev => ({
      ...prev,
      message: newMessageData
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full text-gray-500"><Loader2 className="animate-spin mr-2" /> Cargando configuración...</div>;
  }

  if (!settings) return <div className="text-center p-8">Error al cargar el módulo</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Módulo de Despedidas</h1>
          <p className="text-gray-400">Configura el mensaje cuando un miembro abandona el servidor.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className={`text-sm font-medium ${settings.enabled ? 'text-green-400' : 'text-gray-400'}`}>
              {settings.enabled ? 'Activado' : 'Desactivado'}
            </span>
            <button onClick={toggleEnabled} className="focus:outline-none">
              {settings.enabled ? 
                <ToggleRight className="text-green-500 w-8 h-8 transition-colors" /> : 
                <ToggleLeft className="text-gray-500 w-8 h-8 transition-colors" />
              }
            </button>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </header>

      <div className={`space-y-8 transition-opacity duration-300 ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        
        {/* Channel Selection */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="text-purple-400 w-5 h-5" />
            Canal de Despedida
          </h3>
          <div className="grid gap-2">
            <label className="text-sm text-gray-400">Selecciona dónde se enviarán los mensajes</label>
            <ChannelSelector 
              guildId={guildId}
              value={settings.channelId}
              onChange={(newId) => setSettings({...settings, channelId: newId})}
              placeholder="Selecciona un canal de texto"
            />
          </div>
        </div>

        {/* Message Editor Component */}
        <div>
          <h3 className="text-lg font-bold mb-4">Personalización del Mensaje</h3>
          <MessageEditor 
            data={settings.message}
            onChange={handleMessageChange}
            variables={['{user}', '{server}', '{memberCount}']}
          />
        </div>

      </div>
    </div>
  );
}
