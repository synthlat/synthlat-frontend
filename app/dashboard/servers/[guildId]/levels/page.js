'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, BarChart3, MessageSquare, Image as ImageIcon, Reply, Clock, TrendingUp, Bell, ToggleLeft, ToggleRight } from 'lucide-react';
import MessageEditor from '@/app/dashboard/components/MessageEditor';
import ChannelSelector from '@/app/dashboard/components/ChannelSelector';

export default function LevelsModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/modules/levels/${guildId}`)
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
      const res = await fetch(`/api/v1/modules/levels/${guildId}`, {
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

  const updateXpRate = (field, value) => {
    setSettings(prev => ({
      ...prev,
      xpRates: { ...prev.xpRates, [field]: parseInt(value) || 0 }
    }));
  };

  const updateCurve = (field, value) => {
    setSettings(prev => ({
      ...prev,
      curve: { ...prev.curve, [field]: parseFloat(value) || 0 }
    }));
  };

  const updateNotification = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notification: { ...prev.notification, [field]: value }
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
          <h1 className="text-3xl font-bold mb-2">Sistema de Niveles</h1>
          <p className="text-gray-400">Recompensa a los usuarios activos con XP y niveles.</p>
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
          {/* XP Rates Config */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-400 w-5 h-5" />
              Tasas de Experiencia
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputWithIcon 
                  icon={<MessageSquare size={16} />} 
                  label="Mensaje de Texto" 
                  value={settings.xpRates.message} 
                  onChange={(v) => updateXpRate('message', v)} 
                  suffix="XP"
                />
                <InputWithIcon 
                  icon={<ImageIcon size={16} />} 
                  label="Imagen / Archivo" 
                  value={settings.xpRates.image} 
                  onChange={(v) => updateXpRate('image', v)} 
                  suffix="XP"
                />
                <InputWithIcon 
                  icon={<Reply size={16} />} 
                  label="Respuesta" 
                  value={settings.xpRates.reply} 
                  onChange={(v) => updateXpRate('reply', v)} 
                  suffix="XP"
                />
                <InputWithIcon 
                  icon={<Clock size={16} />} 
                  label="Cooldown (Anti-Spam)" 
                  value={settings.xpRates.cooldown} 
                  onChange={(v) => updateXpRate('cooldown', v)} 
                  suffix="seg"
                />
              </div>
            </div>
          </div>

          {/* Curve Config */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-pink-400 w-5 h-5" />
              Curva de Nivel
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">XP Base (Nivel 1)</label>
                  <input 
                    type="number" 
                    value={settings.curve.base}
                    onChange={(e) => updateCurve('base', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Multiplicador</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.curve.multiplier}
                    onChange={(e) => updateCurve('multiplier', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Curve Preview */}
              <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Progresión Estimada</h4>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Lvl 1: <span className="text-purple-400">{settings.curve.base} XP</span></span>
                  <span>Lvl 5: <span className="text-purple-400">{Math.round(settings.curve.base * (5 * settings.curve.multiplier))} XP</span></span>
                  <span>Lvl 10: <span className="text-purple-400">{Math.round(settings.curve.base * (10 * settings.curve.multiplier))} XP</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Config */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="text-yellow-400 w-5 h-5" />
            Notificaciones de Nivel
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dónde enviar la notificación</label>
                <select 
                  value={settings.notification.type}
                  onChange={(e) => updateNotification('type', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
                >
                  <option value="current">Canal Actual (donde escribió)</option>
                  <option value="channel">Canal Específico</option>
                  <option value="dm">Mensaje Directo (DM)</option>
                  <option value="none">Desactivado</option>
                </select>
              </div>

              {settings.notification.type === 'channel' && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm text-gray-400 mb-2">Seleccionar Canal</label>
                  <ChannelSelector 
                    guildId={guildId}
                    value={settings.notification.channelId}
                    onChange={(newId) => updateNotification('channelId', newId)}
                    placeholder="Canal de Level Up"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Mensaje de Level Up</label>
              <MessageEditor 
                data={settings.notification.message}
                onChange={(newData) => updateNotification('message', newData)}
                variables={['{user}', '{level}', '{xp}', '{avatar}']}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function InputWithIcon({ icon, label, value, onChange, suffix }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="relative">
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-white focus:border-purple-500 focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{suffix}</span>
      </div>
    </div>
  );
}
