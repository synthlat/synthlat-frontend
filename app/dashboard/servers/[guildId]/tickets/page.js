'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Ticket, Plus, Trash2, Edit, ChevronRight, ToggleLeft, ToggleRight, Layout, Folder, MessageSquare, Shield } from 'lucide-react';
import MessageEditor from '@/app/dashboard/components/MessageEditor';
import ChannelSelector from '@/app/dashboard/components/ChannelSelector';
import RoleSelector from '@/app/dashboard/components/RoleSelector';
import { DEFAULT_PANEL } from '@/lib/modules/tickets-client';

export default function TicketsModulePage() {
  const { guildId } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanelId, setActivePanelId] = useState(null);
  const [editingSection, setEditingSection] = useState('general'); // general, panelMessage, categories
  const [activeCategoryId, setActiveCategoryId] = useState(null); // For editing specific category details

  useEffect(() => {
    fetch(`/api/v1/modules/tickets/${guildId}`)
      .then(res => {
        if (res.status === 401) window.location.href = '/dashboard';
        return res.json();
      })
      .then(data => {
        if (!data.panels) data.panels = [];
        setSettings(data);
        if (data.panels.length > 0) setActivePanelId(data.panels[0].id);
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
      const res = await fetch(`/api/v1/modules/tickets/${guildId}`, {
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

  const addPanel = () => {
    if (settings.panels.length >= 8) return;
    const newPanel = {
      ...DEFAULT_PANEL,
      id: crypto.randomUUID(),
      categories: DEFAULT_PANEL.categories.map(c => ({...c, id: crypto.randomUUID()}))
    };
    setSettings(prev => ({ ...prev, panels: [...prev.panels, newPanel] }));
    setActivePanelId(newPanel.id);
    setEditingSection('general');
  };

  const removePanel = (panelId) => {
    const newPanels = settings.panels.filter(p => p.id !== panelId);
    setSettings(prev => ({ ...prev, panels: newPanels }));
    if (activePanelId === panelId) {
      setActivePanelId(newPanels.length > 0 ? newPanels[0].id : null);
    }
  };

  const updateActivePanel = (field, value) => {
    setSettings(prev => ({
      ...prev,
      panels: prev.panels.map(p => p.id === activePanelId ? { ...p, [field]: value } : p)
    }));
  };

  const updateCategory = (catId, field, value) => {
    const newCategories = activePanel.categories.map(c => 
      c.id === catId ? { ...c, [field]: value } : c
    );
    updateActivePanel('categories', newCategories);
  };

  const activePanel = settings?.panels.find(p => p.id === activePanelId);
  const activeCategory = activePanel?.categories.find(c => c.id === activeCategoryId);

  if (loading) {
    return <div className="flex justify-center items-center h-full text-gray-500"><Loader2 className="animate-spin mr-2" /> Cargando configuración...</div>;
  }

  if (!settings) return <div className="text-center p-8">Error al cargar el módulo</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sistema de Tickets</h1>
          <p className="text-gray-400">Crea paneles de soporte para que tus usuarios contacten al staff.</p>
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

      <div className={`transition-opacity duration-300 ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        
        {/* Panels Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {settings.panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => { setActivePanelId(panel.id); setEditingSection('general'); setActiveCategoryId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
                activePanelId === panel.id 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Ticket size={16} />
              {panel.name}
            </button>
          ))}
          {settings.panels.length < 8 && (
            <button 
              onClick={addPanel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors whitespace-nowrap"
            >
              <Plus size={16} /> Nuevo Panel
            </button>
          )}
        </div>

        {activePanel ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation for Panel Config */}
            <div className="lg:col-span-1 space-y-2">
              <NavButton 
                active={editingSection === 'general'} 
                onClick={() => { setEditingSection('general'); setActiveCategoryId(null); }} 
                label="Configuración General" 
              />
              <NavButton 
                active={editingSection === 'panelMessage'} 
                onClick={() => { setEditingSection('panelMessage'); setActiveCategoryId(null); }} 
                label="Mensaje del Panel" 
              />
              <NavButton 
                active={editingSection === 'categories'} 
                onClick={() => { setEditingSection('categories'); setActiveCategoryId(null); }} 
                label="Categorías" 
              />
              
              <div className="pt-4 mt-4 border-t border-white/10">
                <button 
                  onClick={() => removePanel(activePanel.id)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} /> Eliminar Panel
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {editingSection === 'general' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">Información Básica</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Nombre del Panel (Interno)</label>
                        <input 
                          type="text" 
                          value={activePanel.name}
                          onChange={(e) => updateActivePanel('name', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Canal del Panel</label>
                        <ChannelSelector 
                          guildId={guildId}
                          value={activePanel.channelId}
                          onChange={(newId) => updateActivePanel('channelId', newId)}
                          placeholder="Selecciona donde aparecerá el panel"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Shield className="text-blue-400 w-5 h-5" />
                      Roles de Soporte Global
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-400">Roles que pueden ver todos los tickets de este panel</label>
                      <RoleSelector 
                        guildId={guildId}
                        selectedRoles={activePanel.supportRoles || []}
                        onChange={(newRoles) => updateActivePanel('supportRoles', newRoles)}
                        placeholder="Selecciona roles de staff"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingSection === 'panelMessage' && (
                <div className="animate-fade-in-up">
                  <h3 className="text-lg font-bold mb-4">Diseño del Panel</h3>
                  <MessageEditor 
                    data={activePanel.panelMessage}
                    onChange={(newData) => updateActivePanel('panelMessage', newData)}
                    variables={['{server}', '{memberCount}']}
                  />
                </div>
              )}

              {editingSection === 'categories' && !activeCategoryId && (
                <div className="animate-fade-in-up space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Categorías de Soporte</h3>
                    <button 
                      onClick={() => {
                        const newId = crypto.randomUUID();
                        const newCats = [...activePanel.categories, { 
                          id: newId, 
                          label: "Nueva Categoría", 
                          value: `cat_${Date.now()}`, 
                          description: "", 
                          emoji: "🎫",
                          categoryId: null,
                          ticketMessage: {
                            content: "¡Hola {user}! Un miembro del staff te atenderá pronto.",
                            embeds: []
                          },
                          supportRoles: []
                        }];
                        updateActivePanel('categories', newCats);
                        setActiveCategoryId(newId);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-700"
                    >
                      <Plus size={14} /> Añadir
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activePanel.categories.map((cat, idx) => (
                      <div key={cat.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{cat.emoji}</div>
                          <div>
                            <h4 className="font-bold text-white">{cat.label}</h4>
                            <p className="text-sm text-gray-400">{cat.description || "Sin descripción"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setActiveCategoryId(cat.id)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => {
                              const newCats = activePanel.categories.filter((_, i) => i !== idx);
                              updateActivePanel('categories', newCats);
                            }}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editingSection === 'categories' && activeCategoryId && activeCategory && (
                <div className="animate-fade-in-up space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={() => setActiveCategoryId(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Categorías
                    </button>
                    <ChevronRight size={16} className="text-gray-600" />
                    <span className="font-bold text-purple-400">{activeCategory.label}</span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Edit size={18} className="text-blue-400" />
                      Configuración Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Etiqueta (Label)</label>
                        <input 
                          type="text" 
                          value={activeCategory.label}
                          onChange={(e) => updateCategory(activeCategory.id, 'label', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Emoji</label>
                        <input 
                          type="text" 
                          value={activeCategory.emoji}
                          onChange={(e) => updateCategory(activeCategory.id, 'emoji', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descripción</label>
                      <input 
                        type="text" 
                        value={activeCategory.description}
                        onChange={(e) => updateCategory(activeCategory.id, 'description', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Shield size={18} className="text-red-400" />
                      Roles de Soporte Específicos
                    </h3>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Roles que pueden ver tickets de esta categoría (además de los globales)</label>
                      <RoleSelector 
                        guildId={guildId}
                        selectedRoles={activeCategory.supportRoles || []}
                        onChange={(newRoles) => updateCategory(activeCategory.id, 'supportRoles', newRoles)}
                        placeholder="Selecciona roles específicos"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Folder size={18} className="text-yellow-400" />
                      Destino del Ticket
                    </h3>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Categoría de Discord donde se crearán los tickets</label>
                      <ChannelSelector 
                        guildId={guildId}
                        value={activeCategory.categoryId}
                        onChange={(newId) => updateCategory(activeCategory.id, 'categoryId', newId)}
                        placeholder="Selecciona una categoría de canales"
                        type="category"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <MessageSquare size={18} className="text-green-400" />
                      Mensaje dentro del Ticket
                    </h3>
                    <MessageEditor 
                      data={activeCategory.ticketMessage}
                      onChange={(newData) => updateCategory(activeCategory.id, 'ticketMessage', newData)}
                      variables={['{user}', '{server}', '{reason}']}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No hay paneles creados</h3>
            <p className="text-gray-400 mb-6">Crea tu primer panel de tickets para comenzar.</p>
            <button 
              onClick={addPanel}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-colors"
            >
              Crear Panel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function NavButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
      <ChevronRight size={16} className={active ? 'text-purple-400' : 'opacity-0'} />
    </button>
  );
}
