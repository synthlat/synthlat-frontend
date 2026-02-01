'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Mic, Folder, Users, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import ChannelSelector from '@/app/dashboard/components/ChannelSelector';
import RoleSelector from '@/app/dashboard/components/RoleSelector';

export default function TempVoiceModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/modules/tempvoice/${guildId}`)
      .then(res => {
        if (res.status === 401) window.location.href = '/dashboard';
        return res.json();
      })
      .then(data => {
        if (!data.allowedRoles) data.allowedRoles = [];
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
      const res = await fetch(`/api/v1/modules/tempvoice/${guildId}`, {
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

  if (loading) {
    return <div className="flex justify-center items-center h-full text-gray-500"><Loader2 className="animate-spin mr-2" /> Cargando configuración...</div>;
  }

  if (!settings) return <div className="text-center p-8">Error al cargar el módulo</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Canales Temporales</h1>
          <p className="text-gray-400">Permite a los usuarios crear sus propios canales de voz dinámicamente.</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Config */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Mic className="text-purple-400 w-5 h-5" />
                Canal Generador
              </h3>
              <div className="grid gap-2">
                <label className="text-sm text-gray-400">El canal de voz al que deben unirse para crear uno nuevo</label>
                <ChannelSelector 
                  guildId={guildId}
                  value={settings.channelId}
                  onChange={(newId) => setSettings({...settings, channelId: newId})}
                  placeholder="Selecciona un canal de voz"
                  type="voice"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Folder className="text-yellow-400 w-5 h-5" />
                Categoría de Destino
              </h3>
              <div className="grid gap-2">
                <label className="text-sm text-gray-400">Dónde se crearán los canales temporales</label>
                <ChannelSelector 
                  guildId={guildId}
                  value={settings.categoryId}
                  onChange={(newId) => setSettings({...settings, categoryId: newId})}
                  placeholder="Selecciona una categoría"
                  type="category"
                />
              </div>
            </div>
          </div>

          {/* Limits & Permissions */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="text-blue-400 w-5 h-5" />
                Límites y Nombres
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Límite de Usuarios por Defecto</label>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      min="0"
                      max="99"
                      value={settings.defaultLimit}
                      onChange={(e) => setSettings({...settings, defaultLimit: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                    <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                      {settings.defaultLimit === 0 ? "Ilimitado" : "Usuarios"}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Plantilla de Nombre</label>
                  <input 
                    type="text" 
                    value={settings.channelName}
                    onChange={(e) => setSettings({...settings, channelName: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="{user}'s Channel"
                  />
                  <p className="text-xs text-gray-500 mt-1">Variable: <code className="text-purple-300">{'{user}'}</code></p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="text-red-400 w-5 h-5" />
                Permisos de Creación
              </h3>
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">Roles permitidos para crear canales (Dejar vacío para todos)</label>
                <RoleSelector 
                  guildId={guildId}
                  selectedRoles={settings.allowedRoles}
                  onChange={(newRoles) => setSettings({...settings, allowedRoles: newRoles})}
                  placeholder="Todos los usuarios"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
