'use client';

import { useState } from 'react';
import { Plus, Trash2, Zap, Tag, Calendar, Edit, Save, X } from 'lucide-react';

export default function NewsManager({ initialNews }) {
  const [news, setNews] = useState(initialNews);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Nuevo');
  const [tagColor, setTagColor] = useState('bg-purple-500');
  
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTag('Nuevo');
    setTagColor('bg-purple-500');
    setEditingId(null);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setTag(item.tag);
    setTagColor(item.tagColor);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);
    try {
      const url = '/api/v1/news';
      const method = editingId ? 'PUT' : 'POST';
      const body = { title, description, tag, tagColor };
      
      if (editingId) body.id = editingId;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const resultItem = await res.json();
        
        if (editingId) {
          setNews(news.map(n => n.id === editingId ? { ...n, ...resultItem } : n));
        } else {
          setNews([resultItem, ...news]);
        }
        resetForm();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;
    
    try {
      const res = await fetch(`/api/v1/news?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNews(news.filter(n => n.id !== id));
        if (editingId === id) resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add/Edit Form */}
      <div className={`bg-white/5 border ${editingId ? 'border-purple-500' : 'border-white/10'} rounded-xl p-6 transition-colors`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {editingId ? <Edit size={20} className="text-purple-400" /> : <Plus size={20} className="text-green-400" />}
          {editingId ? 'Editar Novedad' : 'Publicar Novedad'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Título</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                placeholder="Ej: Sistema de Tickets Mejorado"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Etiqueta</label>
                <select 
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none appearance-none"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Mejora">Mejora</option>
                  <option value="Fix">Fix</option>
                  <option value="Aviso">Aviso</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Color</label>
                <select 
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none appearance-none"
                >
                  <option value="bg-purple-500">Púrpura</option>
                  <option value="bg-blue-500">Azul</option>
                  <option value="bg-green-500">Verde</option>
                  <option value="bg-yellow-500">Amarillo</option>
                  <option value="bg-red-500">Rojo</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descripción</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none resize-none"
              placeholder="Detalles de la actualización..."
            />
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <X size={16} /> Cancelar
              </button>
            )}
            <button 
              type="submit"
              disabled={loading || !title || !description}
              className={`px-6 py-2 ${editingId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50 text-white rounded-lg font-bold transition-colors flex items-center gap-2`}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : editingId ? <Save size={16} /> : <Plus size={16} />}
              {loading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>

      {/* News List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Historial de Novedades
        </h2>
        {news.length > 0 ? (
          <div className="grid gap-4">
            {news.map((item) => (
              <div key={item.id} className={`bg-white/5 border ${editingId === item.id ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'} rounded-xl p-4 flex gap-4 group transition-colors`}>
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Zap size={20} className="text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-200 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(item)}
                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteNews(item.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
            No hay noticias publicadas.
          </div>
        )}
      </div>
    </div>
  );
}
