'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Coins, ShoppingBag, Gavel, TrendingUp, ToggleLeft, ToggleRight, Clock, MessageSquare, Image as ImageIcon, Reply, Plus, Trash2, Edit, Package, Shield } from 'lucide-react';
import RoleSelector from '@/app/dashboard/components/RoleSelector';

export default function EconomyModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general, shop, auctions

  useEffect(() => {
    fetch(`/api/v1/modules/economy/${guildId}`)
      .then(res => {
        if (res.status === 401) window.location.href = '/dashboard';
        return res.json();
      })
      .then(data => {
        if (!data.shop.items) data.shop.items = [];
        // Ensure roles array exists for each item
        data.shop.items.forEach(item => {
          if (!item.roles) item.roles = [];
        });
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
      const res = await fetch(`/api/v1/modules/economy/${guildId}`, {
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

  const updateIncomeRate = (field, value) => {
    setSettings(prev => ({
      ...prev,
      incomeRates: { ...prev.incomeRates, [field]: parseInt(value) || 0 }
    }));
  };

  // Shop Item Management
  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      name: "Nuevo Item",
      description: "",
      price: 100,
      stock: -1, // -1 for unlimited
      image: "",
      roles: []
    };
    setSettings(prev => ({
      ...prev,
      shop: { ...prev.shop, items: [...prev.shop.items, newItem] }
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...settings.shop.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings(prev => ({
      ...prev,
      shop: { ...prev.shop, items: newItems }
    }));
  };

  const removeItem = (index) => {
    const newItems = settings.shop.items.filter((_, i) => i !== index);
    setSettings(prev => ({
      ...prev,
      shop: { ...prev.shop, items: newItems }
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
          <h1 className="text-3xl font-bold mb-2">Sistema de Economía</h1>
          <p className="text-gray-400">Gestiona la moneda, tiendas y subastas de tu servidor.</p>
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
        
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-1 overflow-x-auto">
          <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<Coins size={16} />} label="General" />
          <TabButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShoppingBag size={16} />} label="Tienda del Servidor" />
          <TabButton active={activeTab === 'auctions'} onClick={() => setActiveTab('auctions')} icon={<Gavel size={16} />} label="Subastas" />
        </div>

        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Coins className="text-yellow-400 w-5 h-5" />
                  Configuración de Moneda
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Nombre de la Moneda</label>
                      <input 
                        type="text" 
                        value={settings.currency.name}
                        onChange={(e) => setSettings({...settings, currency: {...settings.currency, name: e.target.value}})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Símbolo</label>
                      <input 
                        type="text" 
                        value={settings.currency.symbol}
                        onChange={(e) => setSettings({...settings, currency: {...settings.currency, symbol: e.target.value}})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Balance Inicial</label>
                    <input 
                      type="number" 
                      value={settings.initialBalance}
                      onChange={(e) => setSettings({...settings, initialBalance: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-400 w-5 h-5" />
                  Ingresos por Actividad
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputWithIcon 
                    icon={<MessageSquare size={16} />} 
                    label="Mensaje" 
                    value={settings.incomeRates.message} 
                    onChange={(v) => updateIncomeRate('message', v)} 
                    suffix={settings.currency.symbol}
                  />
                  <InputWithIcon 
                    icon={<ImageIcon size={16} />} 
                    label="Imagen" 
                    value={settings.incomeRates.image} 
                    onChange={(v) => updateIncomeRate('image', v)} 
                    suffix={settings.currency.symbol}
                  />
                  <InputWithIcon 
                    icon={<Reply size={16} />} 
                    label="Respuesta" 
                    value={settings.incomeRates.reply} 
                    onChange={(v) => updateIncomeRate('reply', v)} 
                    suffix={settings.currency.symbol}
                  />
                  <InputWithIcon 
                    icon={<Clock size={16} />} 
                    label="Cooldown" 
                    value={settings.incomeRates.cooldown} 
                    onChange={(v) => updateIncomeRate('cooldown', v)} 
                    suffix="seg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag className="text-blue-400 w-5 h-5" />
                  Items de la Tienda
                </h3>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <span className={`text-xs font-medium ${settings.shop.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.shop.enabled ? 'Tienda Activa' : 'Tienda Inactiva'}
                  </span>
                  <button 
                    onClick={() => setSettings(prev => ({ ...prev, shop: { ...prev.shop, enabled: !prev.shop.enabled } }))}
                    className="focus:outline-none"
                  >
                    {settings.shop.enabled ? 
                      <ToggleRight className="text-green-500 w-6 h-6" /> : 
                      <ToggleLeft className="text-gray-500 w-6 h-6" />
                    }
                  </button>
                </div>
              </div>
              <button 
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} /> Crear Item
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${!settings.shop.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {settings.shop.items.map((item, idx) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-purple-500/30 transition-colors">
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 bg-black/40 rounded-lg shrink-0 overflow-hidden border border-white/5 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="text-gray-600" size={24} />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 px-1 py-0.5 text-sm font-bold focus:border-purple-500 outline-none"
                        placeholder="Nombre del Item"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-400">{settings.currency.symbol}</span>
                        <input 
                          type="number" 
                          value={item.price}
                          onChange={(e) => updateItem(idx, 'price', parseInt(e.target.value))}
                          className="w-20 bg-transparent border-b border-white/10 px-1 py-0.5 text-sm focus:border-purple-500 outline-none"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <textarea 
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:border-purple-500 outline-none resize-none h-16"
                      placeholder="Descripción del item..."
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Stock (-1 = Infinito)</label>
                        <input 
                          type="number" 
                          value={item.stock}
                          onChange={(e) => updateItem(idx, 'stock', parseInt(e.target.value))}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Imagen URL</label>
                        <input 
                          type="text" 
                          value={item.image}
                          onChange={(e) => updateItem(idx, 'image', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Shield size={10} /> Roles a otorgar
                      </label>
                      <RoleSelector 
                        guildId={guildId}
                        selectedRoles={item.roles || []}
                        onChange={(newRoles) => updateItem(idx, 'roles', newRoles)}
                        placeholder="Selecciona roles (opcional)"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2 py-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={12} /> Eliminar Item
                    </button>
                  </div>
                </div>
              ))}
              
              {settings.shop.items.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay items en la tienda.</p>
                  <button onClick={addItem} className="text-purple-400 hover:underline mt-2 text-sm">Crear el primero</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div className="animate-fade-in-up">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Gavel className="text-red-400 w-5 h-5" />
                  Configuración de Subastas
                </h3>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, auctions: { ...prev.auctions, enabled: !prev.auctions.enabled } }))}
                  className="focus:outline-none"
                >
                  {settings.auctions.enabled ? 
                    <ToggleRight className="text-green-500 w-8 h-8" /> : 
                    <ToggleLeft className="text-gray-500 w-8 h-8" />
                  }
                </button>
              </div>
              
              <div className={`space-y-4 transition-opacity ${settings.auctions.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Puja Inicial Mínima</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={settings.auctions.minPrice}
                        onChange={(e) => setSettings({...settings, auctions: {...settings.auctions, minPrice: parseInt(e.target.value)}})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{settings.currency.symbol}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Puja Inicial Máxima</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={settings.auctions.maxPrice}
                        onChange={(e) => setSettings({...settings, auctions: {...settings.auctions, maxPrice: parseInt(e.target.value)}})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-white focus:border-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{settings.currency.symbol}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Los usuarios podrán crear subastas dentro de estos rangos de precio inicial.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
        active 
          ? 'border-purple-500 text-purple-400' 
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
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
