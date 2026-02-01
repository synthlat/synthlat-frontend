'use client';

import { useState, useEffect } from 'react';
import { Shield, ChevronDown, Loader2, Check } from 'lucide-react';

export default function RoleSelector({ guildId, selectedRoles = [], onChange, placeholder = "Selecciona roles" }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!guildId) return;

    fetch(`/api/v1/guilds/${guildId}/roles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoles(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load roles', err);
        setLoading(false);
      });
  }, [guildId]);

  const toggleRole = (roleId) => {
    const newSelection = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    onChange(newSelection);
  };

  // Helper to convert int color to hex string
  const intToHex = (intColor) => {
    if (!intColor) return '#99aab5'; // Default gray
    return '#' + intColor.toString(16).padStart(6, '0');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm transition-colors focus:outline-none focus:border-purple-500 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black/70'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-wrap">
          {loading ? (
            <Loader2 className="animate-spin text-gray-400" size={16} />
          ) : selectedRoles.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {selectedRoles.map(roleId => {
                const role = roles.find(r => r.id === roleId);
                return role ? (
                  <span 
                    key={roleId} 
                    className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 bg-white/10"
                    style={{ color: intToHex(role.color) }}
                  >
                    @{role.name}
                  </span>
                ) : null;
              })}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-black/20 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-fade-in-up">
          {roles.length > 0 ? (
            <div className="p-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors hover:bg-white/5`}
                >
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: intToHex(role.color) }}
                  />
                  <span className={`truncate ${selectedRoles.includes(role.id) ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {role.name}
                  </span>
                  {selectedRoles.includes(role.id) && <Check className="ml-auto text-purple-400" size={14} />}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron roles.
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
