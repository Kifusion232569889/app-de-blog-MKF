import React, { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff, HelpCircle, ExternalLink } from 'lucide-react';
import { WixSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WixSettings) => void;
  initialSettings: WixSettings;
}

const WixConfigModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialSettings }) => {
  const [apiKey, setApiKey] = useState(initialSettings.apiKey);
  const [siteId, setSiteId] = useState(initialSettings.siteId);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if(isOpen) {
        setApiKey(initialSettings.apiKey);
        setSiteId(initialSettings.siteId);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ apiKey, siteId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-200 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
             <span className="font-bold text-xl">W</span>
           </div>
           <div>
             <h3 className="text-2xl font-serif font-bold text-gray-900">Conectar con Wix</h3>
             <p className="text-sm text-gray-500">Configuración de API para publicar borradores</p>
           </div>
        </div>

        <div className="space-y-6">
          
          {/* Site ID Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-bold text-gray-800">1. Wix Site ID</label>
               <span className="text-xs text-ki-purple font-medium flex items-center gap-1 cursor-help" title="Está en la URL de tu Dashboard: manage.wix.com/dashboard/{SITE-ID}/...">
                 <HelpCircle size={14} /> ¿Dónde está?
               </span>
            </div>
            <input 
              type="text" 
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Ej: 1983085f-..."
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-ki-purple focus:border-transparent outline-none shadow-sm font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lo encuentras en la URL de tu panel de Wix. Ej: <code>.../dashboard/<strong>tú-site-id-aquí</strong>/home</code>
            </p>
          </div>
          
          {/* API Key Input */}
          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-bold text-gray-800">2. API Key</label>
               <a href="https://manage.wix.com/account/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                 <ExternalLink size={14} /> Crear Key Aquí
               </a>
            </div>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"} 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ej: IST.eyJhbGciOiJ..."
                className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-ki-purple focus:border-transparent outline-none shadow-sm font-mono text-sm pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3.5 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
              ⚠️ <strong>No uses el "App Secret"</strong>. Ve a <em>Configuración de la Cuenta {'>'} Claves de API</em> y crea una nueva con permisos para <strong>"Wix Blog"</strong>.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors bg-white border border-gray-200"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Guardar Conexión
            </button>
        </div>
      </div>
    </div>
  );
};

export default WixConfigModal;