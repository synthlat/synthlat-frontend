'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, MessageSquare, Shield, Bot, ToggleLeft, ToggleRight, AlertTriangle, Sparkles, Key, ExternalLink, Eye, EyeOff, Gavel, Clock } from 'lucide-react';
import ChannelSelector from '@/app/dashboard/components/ChannelSelector';
import RoleSelector from '@/app/dashboard/components/RoleSelector';

export default function ReportsModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/modules/reports/${guildId}`)
      .then(res => {
        if (res.status === 401) window.location.href = '/dashboard';
        return res.json();
      })
      .then(data => {
        // Ensure structure
        if (!data.ai) data.ai = { enabled: false, confidenceThreshold: 80, contextPrompt: "El usuario {username} esta siendo activamente toxico y de ninguna forma es lenguaje coloquial", hasApiKey: false };
        if (!data.adminRoles) data.adminRoles = [];
        if (!data.punishment) data.punishment = { type: 'none', duration: 60 };
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
    
    const payload = { ...settings };
    
    if (apiKeyInput) {
      payload.ai.apiKey = apiKeyInput;
    } else {
      payload.ai.apiKey = null;
    }

    try {
      const res = await fetch(`/api/v1/modules/reports/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      const updatedData = await res.json();
      
      if (apiKeyInput) {
        setSettings(prev => ({ ...prev, ai: { ...prev.ai, hasApiKey: true } }));
        setApiKeyInput('');
      }
      
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
          <h1 className="text-3xl font-bold mb-2">Sistema de Reportes</h1>
          <p className="text-gray-400">Gestiona las denuncias de usuarios y la moderación automática con IA.</p>
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
          {/* Left Column: General & Punishment */}
          <div className="space-y-6">
            {/* General Config */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="text-purple-400 w-5 h-5" />
                Canal de Reportes
              </h3>
              <div className="grid gap-2">
                <label className="text-sm text-gray-400">Donde se enviarán los tickets de reporte</label>
                <ChannelSelector 
                  guildId={guildId}
                  value={settings.channelId}
                  onChange={(newId) => setSettings({...settings, channelId: newId})}
                  placeholder="Selecciona un canal de texto"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="text-blue-400 w-5 h-5" />
                Permisos de Administración
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Roles que pueden gestionar reportes</label>
                  <RoleSelector 
                    guildId={guildId}
                    selectedRoles={settings.adminRoles}
                    onChange={(newRoles) => setSettings({...settings, adminRoles: newRoles})}
                    placeholder="Selecciona roles de staff"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="block text-sm font-medium text-gray-200">Reportar Administradores</span>
                    <span className="text-xs text-gray-500">Permitir que los usuarios reporten a miembros del staff</span>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, allowAdminReports: !settings.allowAdminReports})}
                    className="focus:outline-none"
                  >
                    {settings.allowAdminReports ? 
                      <ToggleRight className="text-green-500 w-8 h-8" /> : 
                      <ToggleLeft className="text-gray-500 w-8 h-8" />
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Punishment Config */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Gavel className="text-red-400 w-5 h-5" />
                Sanción Automática
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo de Sanción</label>
                  <select 
                    value={settings.punishment?.type || 'none'}
                    onChange={(e) => setSettings({...settings, punishment: {...settings.punishment, type: e.target.value}})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors appearance-none"
                  >
                    <option value="none">Ninguna (Solo notificar)</option>
                    <option value="timeout">Aislamiento (Timeout)</option>
                    <option value="kick">Expulsión (Kick)</option>
                    <option value="ban">Baneo (Ban)</option>
                  </select>
                </div>

                {(settings.punishment?.type === 'timeout' || settings.punishment?.type === 'ban') && (
                  <div className="animate-fade-in-up">
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Clock size={14} />
                      Duración
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input 
                          type="number" 
                          min="0"
                          value={settings.punishment?.duration || 0}
                          onChange={(e) => setSettings({...settings, punishment: {...settings.punishment, duration: parseInt(e.target.value)}})}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-400">minutos</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {settings.punishment?.duration === 0 
                        ? (settings.punishment?.type === 'ban' ? 'Baneo permanente' : 'Sin límite de tiempo') 
                        : `Sanción por ${settings.punishment?.duration} minutos`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Config */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bot className="text-pink-400 w-5 h-5" />
                Revisión con IA
              </h3>
              <button 
                onClick={() => setSettings(prev => ({ ...prev, ai: { ...prev.ai, enabled: !prev.ai.enabled } }))}
                className="focus:outline-none"
              >
                {settings.ai?.enabled ? 
                  <ToggleRight className="text-green-500 w-8 h-8" /> : 
                  <ToggleLeft className="text-gray-500 w-8 h-8" />
                }
              </button>
            </div>

            <div className={`space-y-6 transition-opacity ${settings.ai?.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 flex gap-3">
                <Bot className="text-purple-400 shrink-0 mt-1" size={20} />
                <p className="text-sm text-gray-300 leading-relaxed">
                  Cuando se activa, Synthlat analizará automáticamente los últimos <strong>20 mensajes</strong> del contexto del reporte utilizando modelos de lenguaje avanzados para determinar si infringen las políticas de toxicidad o las normas del servidor.
                </p>
              </div>

              {/* API Key Section */}
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <Key size={14} className="text-yellow-400" />
                  Google AI Studio API Key
                </label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className={`w-full bg-black/50 border ${settings.ai?.hasApiKey && !apiKeyInput ? 'border-green-500/50' : 'border-white/10'} rounded-lg pl-4 pr-10 py-3 text-sm text-gray-200 focus:border-purple-500 focus:outline-none transition-colors`}
                    placeholder={settings.ai?.hasApiKey ? "•••••••••••••••• (Clave guardada)" : "Pega tu API Key aquí"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {settings.ai?.hasApiKey ? 
                      <span className="text-green-400 flex items-center gap-1"><Key size={10} /> API Key configurada correctamente</span> : 
                      "Requerido para el funcionamiento de la IA"
                    }
                  </p>
                  <a href="#" target="_blank" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline">
                    ¿Cómo obtener mi API Key? <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-400" />
                  Contexto para la IA
                </label>
                <textarea 
                  value={settings.ai?.contextPrompt || ''}
                  onChange={(e) => setSettings({...settings, ai: {...settings.ai, contextPrompt: e.target.value}})}
                  className="w-full h-24 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Describe qué comportamiento debe buscar la IA..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define qué considera tu servidor como infracción. Variable disponible: <code className="text-purple-300">{'{username}'}</code>
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Umbral de Confianza</label>
                  <span className="text-sm font-bold text-purple-400">{settings.ai?.confidenceThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={settings.ai?.confidenceThreshold || 80}
                  onChange={(e) => setSettings({...settings, ai: {...settings.ai, confidenceThreshold: parseInt(e.target.value)}})}
                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Seguridad mínima requerida para que la IA apruebe un reporte automáticamente. Valores más altos reducen los falsos positivos.
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>El análisis de IA puede tardar unos segundos en procesarse. Los reportes marcados como "Inciertos" requerirán revisión manual.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
