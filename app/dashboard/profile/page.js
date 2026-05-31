'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Heart, Plus, Trash2, AlertTriangle, Check, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false); // Mocked for now
  const [loading, setLoading] = useState(true);
  
  // Sticker Form
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerUrl, setNewStickerUrl] = useState('');
  const [addingSticker, setAddingSticker] = useState(false);

  useEffect(() => {
    // Fetch user profile
    fetch('/api/v1/user')
      .then(res => {
        if (res.status === 401) window.location.href = '/api/v1/oauth/discord';
        return res.json();
      })
      .then(data => setUser(data))
      .catch(console.error);

    // Fetch stickers and status
    fetch('/api/v1/user/stickers')
      .then(res => res.json())
      .then(data => {
        setStickers(data.stickers);
        setTosAccepted(data.tosAccepted);
        setHasVoted(data.hasVoted);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleAcceptTos = async () => {
    try {
      const res = await fetch('/api/v1/user/tos', { method: 'POST' });
      if (res.ok) setTosAccepted(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSticker = async (e) => {
    e.preventDefault();
    if (!newStickerName || !newStickerUrl) return;
    
    setAddingSticker(true);
    try {
      const res = await fetch('/api/v1/user/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStickerName, url: newStickerUrl }),
      });
      
      if (res.ok) {
        const newSticker = await res.json();
        setStickers([...stickers, newSticker]);
        setNewStickerName('');
        setNewStickerUrl('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAddingSticker(false);
    }
  };

  const handleDeleteSticker = async (id) => {
    try {
      const res = await fetch(`/api/v1/user/stickers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStickers(stickers.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando perfil...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-purple-900 to-blue-900"></div>
            
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="relative w-32 h-32 rounded-full border-4 border-black bg-gray-800 overflow-hidden shrink-0">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                      {user?.username?.[0]}
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <a 
                    href="https://top.gg/bot/1036399641887002684/vote"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(219,39,119,0.4)]"
                  >
                    <Heart size={16} className="fill-white" />
                    Votar
                  </a>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold">{user?.global_name || user?.username}</h2>
                <p className="text-gray-400">@{user?.username}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
                  <div className="p-2 bg-black/30 rounded-lg">
                    <User size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ID de Discord</div>
                    <div className="font-mono text-xs">{user?.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
                  <div className="p-2 bg-black/30 rounded-lg">
                    <Mail size={18} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm truncate max-w-[150px]">{user?.email || 'No disponible'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
                  <div className="p-2 bg-black/30 rounded-lg">
                    <Calendar size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Miembro desde</div>
                    <div className="text-sm">
                      {/* Date would come from DB in real app */}
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stickers Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎨</span> Mis Stickers
                </h2>
                <p className="text-sm text-gray-400">Añade stickers personalizados para usar con el bot.</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block">
                <span className={`text-sm font-bold ${stickers.length >= 15 ? 'text-red-400' : 'text-purple-400'}`}>
                  {stickers.length} / 15
                </span>
                <p className="text-xs text-gray-500">Usados</p>
              </div>
            </div>

            {!tosAccepted ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Términos de Uso de Stickers</h3>
                <p className="text-gray-300 text-sm mb-6 max-w-lg mx-auto">
                  Para utilizar la función de stickers personalizados, debes aceptar que eres responsable del contenido que subes. 
                  El uso de material ilegal, pornográfico, gore o que incite al odio resultará en el bloqueo permanente de tu cuenta en Synthlat.
                </p>
                <button 
                  onClick={handleAcceptTos}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full font-bold transition-colors flex items-center gap-2 mx-auto"
                >
                  <Check size={18} /> Acepto los Términos
                </button>
              </div>
            ) : !hasVoted ? (
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-6 text-center">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-bold mb-2">Función Bloqueada</h3>
                <p className="text-gray-300 text-sm mb-6 max-w-lg mx-auto">
                  Para desbloquear los stickers personalizados, necesitas votar por Synthlat. 
                  Tu voto nos ayuda a crecer y mantener el bot gratuito. Debes renovar tu voto cada 7 días.
                </p>
                <a 
                  href="https://top.gg/bot/YOUR_BOT_ID/vote" 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold transition-colors"
                >
                  Ir a Votar <ExternalLink size={16} />
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add Sticker Form */}
                <form onSubmit={handleAddSticker} className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                  
                  <div className="flex gap-4 items-end flex-1">
                      {/* Preview */}
                      <div className="w-[38px] h-[38px] bg-black/50 rounded-lg border border-white/10 overflow-hidden shrink-0 flex items-center justify-center mb-[1px]">
                        {newStickerUrl ? (
                          <img 
                            src={newStickerUrl} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <ImageIcon className="text-gray-600" size={18} />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre (ID)</label>
                        <input 
                          type="text" 
                          value={newStickerName}
                          onChange={(e) => setNewStickerName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                          placeholder="Ej: pepe-sad"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none font-mono"
                          maxLength={32}
                        />
                      </div>
                  </div>

                  <div className="flex-[2]">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">URL de la Imagen</label>
                    <input 
                      type="url" 
                      value={newStickerUrl}
                      onChange={(e) => setNewStickerUrl(e.target.value)}
                      placeholder="https://imgur.com/..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={addingSticker || stickers.length >= 15 || !newStickerName || !newStickerUrl}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors h-[38px] flex items-center justify-center gap-2"
                  >
                    {addingSticker ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    Añadir
                  </button>
                </form>

                {/* Stickers Grid */}
                {stickers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {stickers.map((sticker) => (
                      <div key={sticker.id} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden aspect-square flex flex-col">
                        <div className="flex-1 relative">
                          <img 
                            src={sticker.url} 
                            alt={sticker.name} 
                            className="w-full h-full object-contain p-2"
                            onError={(e) => e.target.src = '/images/placeholder.png'} // Fallback if needed
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => handleDeleteSticker(sticker.id)}
                              className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-black/40 p-2 text-center border-t border-white/5">
                          <p className="text-xs font-bold truncate font-mono">:{sticker.name}:</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                    <p>No tienes stickers guardados.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
    </div>
  );
}
