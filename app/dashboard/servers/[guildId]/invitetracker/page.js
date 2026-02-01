'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, UserPlus, UserMinus, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import MessageEditor from '@/app/dashboard/components/MessageEditor';
import ChannelSelector from '@/app/dashboard/components/ChannelSelector';

export default function InviteTrackerModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('join'); // join, leave

  useEffect(() => {
    fetch(`/api/v1/modules/invitetracker/${guildId}`)
      .then(res => {
        if (res.status === 401) window.location.href = '/dashboard';
        return res.json();
      })
      .then(data => {
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
      const res = await fetch(`/api/v1/modules/invitetracker/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!res.ok) throw new Error('Failed to save');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateMessage = (type, newData) => {
    setSettings(prev => ({
      ...prev,
      [type]: newData
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
          <h1 className="text-3xl font-bold mb-2">Rastreador de Invitaciones</h1>
          <p className="text-gray-400">Monitorea quién invita a quién y mantén un registro de las invitaciones.</p>
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
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="text-purple-400 w-5 h-5" />
            Canal de Registros
          </h3>
          <div className="grid gap-2">
            <label className="text-sm text-gray-400">Donde se enviarán los mensajes de entrada/salida</label>
            <ChannelSelector 
              guildId={guildId}
              value={settings.channelId}
              onChange={(newId) => setSettings({...settings, channelId: newId})}
              placeholder="Selecciona un canal de texto"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'join' ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <UserPlus size={18} /> Mensaje de Entrada
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'leave' ? 'bg-purple-600/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <UserMinus size={18} /> Mensaje de Salida
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'join' && (
              <div className="animate-fade-in-up">
                <MessageEditor 
                  data={settings.joinMessage}
                  onChange={(newData) => updateMessage('joinMessage', newData)}
                  variables={['{user}', '{inviter}', '{code}', '{uses}']}
                />
              </div>
            )}

            {activeTab === 'leave' && (
              <div className="animate-fade-in-up">
                <MessageEditor 
                  data={settings.leaveMessage}
                  onChange={(newData) => updateMessage('leaveMessage', newData)}
                  variables={['{user}', '{inviter}']}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
