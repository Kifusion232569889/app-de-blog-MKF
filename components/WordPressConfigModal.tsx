
import React, { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff, HelpCircle, ExternalLink, CheckCircle, Trash2, Globe, User, Key } from 'lucide-react';
import { WordPressSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WordPressSettings) => void;
  initialSettings: WordPressSettings;
}

const WordPressConfigModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialSettings }) => {
  const [siteUrl, setSiteUrl] = useState(initialSettings.siteUrl || '');
  const [username, setUsername] = useState(initialSettings.username || '');
  const [appPassword, setAppPassword] = useState(initialSettings.applicationPassword || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if(isOpen) {
        setSiteUrl(initialSettings.siteUrl);
        setUsername(initialSettings.username);
        setAppPassword(initialSettings.applicationPassword);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ siteUrl, username, applicationPassword: appPassword });
    onClose();
  };

  const handleClear = () => {
    if(confirm("¿Borrar credenciales?")) {
      onSave({ siteUrl: '', username: '', applicationPassword: '' });
      setSiteUrl('');
      setUsername('');
      setAppPassword('');
    }
  };

  const isConfigured = !!initialSettings.siteUrl && !!initialSettings.applicationPassword;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-200 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-full bg-[#21759b] text-white flex items-center justify-center">
             <Globe size={20} />
           </div>
           <div>
             <h3 className="text-2xl font-serif font-bold text-gray-900">WordPress Connect</h3>
             <p className="text-sm text-gray-500">Configura tu blog para publicar borradores</p>
           </div>
        </div>

        {isConfigured && (
          <div className="mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
            <CheckCircle size={16} className="text-blue-600" />
            <span className="font-medium">WordPress está conectado correctamente.</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1"><Globe size={12}/> URL del Sitio</label>
            <input 
              type="text" 
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://miweb-holistica.com"
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#21759b] outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1"><User size={12}/> Usuario WordPress</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin o tu usuario"
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#21759b] outline-none text-sm"
            />
          </div>
          
          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1"><Key size={12}/> Contraseña de Aplicación</label>
               <span className="text-[10px] text-gray-400 cursor-help" title="Crea una en Usuarios > Perfil > Contraseñas de aplicación">¿Cómo crear una?</span>
            </div>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"} 
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#21759b] outline-none text-sm pr-12 font-mono"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3.5 p-1 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded">
              ⚠️ Ve a WordPress > Usuarios > Perfil. Al final, crea una "Contraseña de aplicación". No es tu contraseña normal.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
            {isConfigured && (
              <button onClick={handleClear} className="px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="flex-1 py-3.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors bg-white border border-gray-200">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 py-3.5 bg-[#21759b] text-white font-semibold rounded-xl hover:bg-[#1a5c7a] transition-all flex items-center justify-center gap-2">
              <Save size={18} /> Guardar
            </button>
        </div>
      </div>
    </div>
  );
};

export default WordPressConfigModal;
