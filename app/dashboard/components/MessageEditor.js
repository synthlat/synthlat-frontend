'use client';

import { useState } from 'react';
import { 
  Bold, Italic, Underline, Link as LinkIcon, 
  ImageIcon, Type, Palette, Layout, Eye, Plus, Trash2, 
  ChevronDown, ChevronUp, Calendar, List, Globe
} from 'lucide-react';

export default function MessageEditor({ data, onChange, variables = [] }) {
  // data structure expected: { content: string, embeds: Array }
  const [activeTab, setActiveTab] = useState('content'); // content, embeds
  const [activeEmbedIndex, setActiveEmbedIndex] = useState(0);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleEmbedChange = (index, field, value) => {
    const newEmbeds = [...(data.embeds || [])];
    // Handle nested updates (e.g. 'author.name')
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newEmbeds[index] = {
        ...newEmbeds[index],
        [parent]: {
          ...(newEmbeds[index][parent] || {}),
          [child]: value
        }
      };
    } else {
      newEmbeds[index] = { ...newEmbeds[index], [field]: value };
    }
    onChange({ ...data, embeds: newEmbeds });
  };

  const addEmbed = () => {
    if ((data.embeds?.length || 0) >= 10) return; // Discord limit
    const newEmbeds = [...(data.embeds || []), { 
      title: 'Nuevo Embed', 
      description: '', 
      color: '#a855f7',
      fields: []
    }];
    onChange({ ...data, embeds: newEmbeds });
    setActiveEmbedIndex(newEmbeds.length - 1);
  };

  const removeEmbed = (index) => {
    const newEmbeds = data.embeds.filter((_, i) => i !== index);
    onChange({ ...data, embeds: newEmbeds });
    if (activeEmbedIndex >= newEmbeds.length) {
      setActiveEmbedIndex(Math.max(0, newEmbeds.length - 1));
    }
  };

  const moveEmbed = (index, direction) => {
    const newEmbeds = [...data.embeds];
    if (direction === 'up' && index > 0) {
      [newEmbeds[index], newEmbeds[index - 1]] = [newEmbeds[index - 1], newEmbeds[index]];
      setActiveEmbedIndex(index - 1);
    } else if (direction === 'down' && index < newEmbeds.length - 1) {
      [newEmbeds[index], newEmbeds[index + 1]] = [newEmbeds[index + 1], newEmbeds[index]];
      setActiveEmbedIndex(index + 1);
    }
    onChange({ ...data, embeds: newEmbeds });
  };

  // Fields Management
  const addField = (embedIndex) => {
    const newEmbeds = [...data.embeds];
    const fields = newEmbeds[embedIndex].fields || [];
    if (fields.length >= 25) return; // Discord limit
    
    newEmbeds[embedIndex] = {
      ...newEmbeds[embedIndex],
      fields: [...fields, { name: 'Nuevo Campo', value: 'Valor', inline: false }]
    };
    onChange({ ...data, embeds: newEmbeds });
  };

  const updateField = (embedIndex, fieldIndex, key, value) => {
    const newEmbeds = [...data.embeds];
    const fields = [...(newEmbeds[embedIndex].fields || [])];
    fields[fieldIndex] = { ...fields[fieldIndex], [key]: value };
    newEmbeds[embedIndex].fields = fields;
    onChange({ ...data, embeds: newEmbeds });
  };

  const removeField = (embedIndex, fieldIndex) => {
    const newEmbeds = [...data.embeds];
    newEmbeds[embedIndex].fields = newEmbeds[embedIndex].fields.filter((_, i) => i !== fieldIndex);
    onChange({ ...data, embeds: newEmbeds });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Editor Column */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col h-[800px]">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/20 overflow-x-auto shrink-0">
          <TabButton 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')} 
            icon={<Type size={16} />} 
            label="Mensaje" 
          />
          <TabButton 
            active={activeTab === 'embeds'} 
            onClick={() => setActiveTab('embeds')} 
            icon={<Layout size={16} />} 
            label={`Embeds (${data.embeds?.length || 0})`} 
          />
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Contenido del Mensaje</label>
                <textarea
                  value={data.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:border-purple-500 focus:outline-none resize-none font-mono"
                  placeholder="Escribe un mensaje normal aquí..."
                />
              </div>
              <VariableList variables={variables} />
            </div>
          )}

          {activeTab === 'embeds' && (
            <div className="flex flex-col h-full">
              {/* Embed List / Selector */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
                {(data.embeds || []).map((embed, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveEmbedIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                      activeEmbedIndex === idx 
                        ? 'bg-purple-600 border-purple-500 text-white' 
                        : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: embed.color || '#000000' }}></span>
                    Embed {idx + 1}
                  </button>
                ))}
                {(data.embeds?.length || 0) < 10 && (
                  <button 
                    onClick={addEmbed}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors whitespace-nowrap"
                  >
                    <Plus size={12} /> Añadir
                  </button>
                )}
              </div>

              {(data.embeds?.length || 0) > 0 ? (
                <div className="space-y-6 animate-fade-in-up pb-4">
                  {/* Embed Actions */}
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-400 uppercase px-2">Configuración General</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveEmbed(activeEmbedIndex, 'up')} disabled={activeEmbedIndex === 0} className="p-1.5 hover:bg-white/10 rounded text-gray-400 disabled:opacity-30"><ChevronUp size={16} /></button>
                      <button onClick={() => moveEmbed(activeEmbedIndex, 'down')} disabled={activeEmbedIndex === (data.embeds.length - 1)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 disabled:opacity-30"><ChevronDown size={16} /></button>
                      <button onClick={() => removeEmbed(activeEmbedIndex)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {/* Author Section */}
                  <Section title="Autor" icon={<Type size={14} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="Nombre">
                        <input 
                          type="text" 
                          value={data.embeds[activeEmbedIndex].author?.name || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'author.name', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                          placeholder="Nombre del autor"
                        />
                      </InputGroup>
                      <InputGroup label="URL del Autor">
                        <input 
                          type="text" 
                          value={data.embeds[activeEmbedIndex].author?.url || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'author.url', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                          placeholder="https://..."
                        />
                      </InputGroup>
                    </div>
                    <div className="mt-4">
                      <InputGroup label="Icono del Autor (URL)">
                        <input 
                          type="text" 
                          value={data.embeds[activeEmbedIndex].author?.icon_url || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'author.icon_url', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                          placeholder="https://..."
                        />
                      </InputGroup>
                    </div>
                  </Section>

                  {/* Main Content Section */}
                  <Section title="Contenido Principal" icon={<Layout size={14} />}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <InputGroup label="Título">
                            <input 
                              type="text" 
                              value={data.embeds[activeEmbedIndex].title || ''}
                              onChange={(e) => handleEmbedChange(activeEmbedIndex, 'title', e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                              placeholder="Título del Embed"
                            />
                          </InputGroup>
                        </div>
                        <div>
                          <InputGroup label="Color">
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={data.embeds[activeEmbedIndex].color || '#000000'}
                                onChange={(e) => handleEmbedChange(activeEmbedIndex, 'color', e.target.value)}
                                className="h-9 w-10 bg-transparent border-none cursor-pointer rounded"
                              />
                              <input 
                                type="text" 
                                value={data.embeds[activeEmbedIndex].color || ''}
                                onChange={(e) => handleEmbedChange(activeEmbedIndex, 'color', e.target.value)}
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-sm font-mono uppercase"
                              />
                            </div>
                          </InputGroup>
                        </div>
                      </div>

                      <InputGroup label="URL del Título">
                        <input 
                          type="text" 
                          value={data.embeds[activeEmbedIndex].url || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'url', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                          placeholder="https://..."
                        />
                      </InputGroup>

                      <InputGroup label="Descripción">
                        <textarea 
                          value={data.embeds[activeEmbedIndex].description || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'description', e.target.value)}
                          className="w-full h-24 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none resize-none"
                          placeholder="Descripción del Embed..."
                        />
                      </InputGroup>
                    </div>
                  </Section>

                  {/* Fields Section */}
                  <Section title={`Campos (${data.embeds[activeEmbedIndex].fields?.length || 0})`} icon={<List size={14} />}>
                    <div className="space-y-3">
                      {(data.embeds[activeEmbedIndex].fields || []).map((field, fIdx) => (
                        <div key={fIdx} className="bg-black/30 border border-white/5 rounded-lg p-3 flex gap-3 items-start group">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              value={field.name}
                              onChange={(e) => updateField(activeEmbedIndex, fIdx, 'name', e.target.value)}
                              className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-sm focus:border-purple-500 outline-none font-bold"
                              placeholder="Nombre del campo"
                            />
                            <textarea 
                              value={field.value}
                              onChange={(e) => updateField(activeEmbedIndex, fIdx, 'value', e.target.value)}
                              className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-sm focus:border-purple-500 outline-none resize-none h-16"
                              placeholder="Valor del campo"
                            />
                            <div className="flex items-center gap-2 mt-1">
                              <input 
                                type="checkbox" 
                                id={`inline-${activeEmbedIndex}-${fIdx}`}
                                checked={field.inline}
                                onChange={(e) => updateField(activeEmbedIndex, fIdx, 'inline', e.target.checked)}
                                className="accent-purple-500"
                              />
                              <label htmlFor={`inline-${activeEmbedIndex}-${fIdx}`} className="text-xs text-gray-400 cursor-pointer select-none">En línea</label>
                            </div>
                          </div>
                          <button onClick={() => removeField(activeEmbedIndex, fIdx)} className="text-gray-500 hover:text-red-400 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {(data.embeds[activeEmbedIndex].fields?.length || 0) < 25 && (
                        <button 
                          onClick={() => addField(activeEmbedIndex)}
                          className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={12} /> Añadir Campo
                        </button>
                      )}
                    </div>
                  </Section>

                  {/* Images Section */}
                  <Section title="Imágenes" icon={<ImageIcon size={14} />}>
                    <div className="grid grid-cols-1 gap-4">
                      <InputGroup label="Imagen Grande (URL)">
                        <input 
                          type="text" 
                          value={data.embeds[activeEmbedIndex].image || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'image', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                          placeholder="https://..."
                        />
                      </InputGroup>
                      <InputGroup label="Thumbnail (URL)">
                        <input 
                          type="text" 
                          value={data.embeds[activeEmbedIndex].thumbnail || ''}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'thumbnail', e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                          placeholder="https://..."
                        />
                      </InputGroup>
                    </div>
                  </Section>

                  {/* Footer Section */}
                  <Section title="Pie de Página" icon={<ChevronDown size={14} />}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Texto del Footer">
                          <input 
                            type="text" 
                            value={data.embeds[activeEmbedIndex].footer?.text || ''}
                            onChange={(e) => handleEmbedChange(activeEmbedIndex, 'footer.text', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                            placeholder="Texto..."
                          />
                        </InputGroup>
                        <InputGroup label="Icono del Footer (URL)">
                          <input 
                            type="text" 
                            value={data.embeds[activeEmbedIndex].footer?.icon_url || ''}
                            onChange={(e) => handleEmbedChange(activeEmbedIndex, 'footer.icon_url', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                            placeholder="https://..."
                          />
                        </InputGroup>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/5">
                        <input 
                          type="checkbox" 
                          id={`timestamp-${activeEmbedIndex}`}
                          checked={data.embeds[activeEmbedIndex].timestamp || false}
                          onChange={(e) => handleEmbedChange(activeEmbedIndex, 'timestamp', e.target.checked)}
                          className="w-4 h-4 accent-purple-500 cursor-pointer"
                        />
                        <label htmlFor={`timestamp-${activeEmbedIndex}`} className="text-sm text-gray-300 cursor-pointer select-none flex items-center gap-2">
                          <Calendar size={14} /> Mostrar fecha y hora actual
                        </label>
                      </div>
                    </div>
                  </Section>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Layout size={48} className="mb-4 opacity-20" />
                  <p className="mb-4">No hay embeds creados</p>
                  <button 
                    onClick={addEmbed}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Crear primer Embed
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Column */}
      <div className="bg-[#313338] rounded-xl overflow-hidden flex flex-col border border-black/20 shadow-xl h-[800px]">
        <div className="p-3 bg-[#2b2d31] border-b border-black/10 flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wide shrink-0">
          <Eye size={14} />
          Vista Previa
        </div>
        <div className="p-6 flex-1 overflow-y-auto font-sans custom-scrollbar">
          <div className="flex gap-4">
            {/* Bot Avatar */}
            <div className="w-10 h-10 rounded-full bg-purple-600 shrink-0 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Message Header */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-white font-medium hover:underline cursor-pointer">Synthlat</span>
                <span className="bg-[#5865F2] text-white text-[10px] px-1 rounded-[3px] h-[15px] flex items-center">BOT</span>
                <span className="text-gray-400 text-xs">Hoy a las 14:30</span>
              </div>

              {/* Content */}
              {data.content && (
                <div className="text-[#dbdee1] whitespace-pre-wrap mb-2 text-[15px] leading-[1.375rem]">
                  {parsePreviewText(data.content)}
                </div>
              )}

              {/* Embeds List */}
              <div className="grid gap-2">
                {(data.embeds || []).map((embed, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#2b2d31] rounded-l border-l-4 max-w-[520px] grid"
                    style={{ borderLeftColor: embed.color || '#1e1f22' }}
                  >
                    <div className="p-4 grid gap-2">
                      {/* Author */}
                      {(embed.author?.name) && (
                        <div className="flex items-center gap-2 mb-1">
                          {embed.author.icon_url && <img src={embed.author.icon_url} alt="" className="w-6 h-6 rounded-full object-cover" />}
                          {embed.author.url ? (
                            <a href="#" className="text-white text-sm font-bold hover:underline">{embed.author.name}</a>
                          ) : (
                            <span className="text-white text-sm font-bold">{embed.author.name}</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0 grid gap-2">
                          {/* Title */}
                          {embed.title && (
                            embed.url ? (
                              <a href="#" className="text-[#00b0f4] font-bold text-base hover:underline cursor-pointer block">
                                {parsePreviewText(embed.title)}
                              </a>
                            ) : (
                              <div className="text-white font-bold text-base">
                                {parsePreviewText(embed.title)}
                              </div>
                            )
                          )}
                          
                          {/* Description */}
                          {embed.description && (
                            <div className="text-[#dbdee1] text-sm whitespace-pre-wrap">
                              {parsePreviewText(embed.description)}
                            </div>
                          )}

                          {/* Fields */}
                          {embed.fields && embed.fields.length > 0 && (
                            <div className="grid gap-2 mt-1" style={{ 
                              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                              display: 'flex',
                              flexWrap: 'wrap'
                            }}>
                              {embed.fields.map((field, fIdx) => (
                                <div key={fIdx} className={field.inline ? 'inline-block mr-4 mb-2 min-w-[120px]' : 'w-full mb-2'}>
                                  <div className="text-[#dbdee1] font-bold text-sm mb-0.5">{field.name}</div>
                                  <div className="text-[#dbdee1] text-sm whitespace-pre-wrap">{field.value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Thumbnail */}
                        {embed.thumbnail && (
                          <img 
                            src={embed.thumbnail} 
                            alt="Thumbnail" 
                            className="w-20 h-20 rounded object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                      </div>

                      {/* Big Image */}
                      {embed.image && (
                        <img 
                          src={embed.image} 
                          alt="Embed Image" 
                          className="w-full rounded mt-2 max-h-[300px] object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}

                      {/* Footer & Timestamp */}
                      {(embed.footer?.text || embed.timestamp) && (
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                          {embed.footer?.icon_url && (
                            <img src={embed.footer.icon_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                          )}
                          <span>
                            {embed.footer?.text}
                            {embed.footer?.text && embed.timestamp && ' • '}
                            {embed.timestamp && 'Hoy a las 14:30'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="bg-black/20 px-4 py-2 border-b border-white/5 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-bold text-gray-200">{title}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'bg-purple-600 text-white' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InputGroup({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function VariableList({ variables }) {
  return (
    <div className="flex flex-wrap gap-2">
      {variables.map((v) => (
        <code 
          key={v} 
          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-purple-300 cursor-pointer hover:bg-purple-500/20 transition-colors"
          title="Click para copiar (simulado)"
        >
          {v}
        </code>
      ))}
    </div>
  );
}

function parsePreviewText(text) {
  if (!text) return '';
  return text
    .replace(/{user}/g, '@Usuario')
    .replace(/{server}/g, 'Servidor')
    .replace(/{memberCount}/g, '450');
}
