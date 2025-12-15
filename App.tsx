import React, { useState, useEffect } from 'react';
import { Wand2, Download, Feather, BookOpen, ImageIcon, Info, Sparkles, Map, FileText, Newspaper, Globe, Link as LinkIcon, BarChart3, Settings, UploadCloud } from 'lucide-react';
import { generateKiFusionPost, generateImageFromPrompt } from './services/geminiService';
import { publishToWix } from './services/wixService';
import { GenerationState, WixSettings } from './types';
import Spinner from './components/Spinner';
import BlogPostViewer from './components/BlogPost';
import AdventureGame from './components/AdventureGame';
import WixConfigModal from './components/WixConfigModal';

type ActiveTab = 'blog' | 'game';
type BlogMode = 'standard' | 'news' | 'analysis';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('blog');
  const [blogMode, setBlogMode] = useState<BlogMode>('standard');
  const [customContext, setCustomContext] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  
  // Wix State
  const [showWixModal, setShowWixModal] = useState(false);
  const [wixSettings, setWixSettings] = useState<WixSettings>({ apiKey: '', siteId: '' });
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Blog State
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null,
    generatedImageUrl: null,
    isImageLoading: false,
  });

  // Load Wix settings from localStorage on mount
  useEffect(() => {
    const savedWix = localStorage.getItem('wixSettings');
    if (savedWix) {
      setWixSettings(JSON.parse(savedWix));
    }
  }, []);

  const handleSaveWix = (settings: WixSettings) => {
    setWixSettings(settings);
    localStorage.setItem('wixSettings', JSON.stringify(settings));
  };

  const handleGenerateBlog = async () => {
    if (blogMode === 'analysis' && !referenceUrl) {
      alert("Por favor ingresa la URL del post que deseas analizar.");
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, generatedImageUrl: null }));
    try {
      const data = await generateKiFusionPost(customContext, blogMode, referenceUrl);
      setState(prev => ({ ...prev, isLoading: false, data }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "Error al generar el contenido." 
      }));
    }
  };

  const handleGenerateImage = async () => {
    if (!state.data?.imagePrompt) return;
    
    setState(prev => ({ ...prev, isImageLoading: true }));
    try {
      const imageUrl = await generateImageFromPrompt(state.data.imagePrompt);
      setState(prev => ({ ...prev, isImageLoading: false, generatedImageUrl: imageUrl }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isImageLoading: false, error: "Error generando la imagen." }));
    }
  };

  const handlePublishToWix = async () => {
    if (!state.data) return;
    if (!wixSettings.apiKey) {
      setShowWixModal(true);
      return;
    }

    setIsPublishing(true);
    try {
      await publishToWix(state.data, wixSettings);
      alert("¡Publicado exitosamente! Revisa tus borradores en Wix.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-ki-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ki-purple to-ki-teal flex items-center justify-center text-white">
                <Feather size={20} />
              </div>
              <h1 className="text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-ki-purple to-ki-teal">
                Método KiFusion
              </h1>
            </div>
            
            {/* Nav Tabs */}
            <div className="flex bg-gray-100/50 p-1 rounded-lg">
                <button 
                   onClick={() => setActiveTab('blog')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'blog' ? 'bg-white shadow text-ki-purple' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <span className="hidden sm:inline">Generator</span>
                   </div>
                </button>
                <button 
                   onClick={() => setActiveTab('game')}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'game' ? 'bg-white shadow text-ki-teal' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <div className="flex items-center gap-2">
                      <Map size={16} />
                      <span className="hidden sm:inline">Holistic Journey</span>
                   </div>
                </button>
            </div>
            
            <div className="flex items-center gap-2">
               {activeTab === 'blog' && (
                 <button 
                    onClick={() => setShowWixModal(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${wixSettings.apiKey ? 'text-ki-teal bg-teal-50' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Configurar Wix"
                 >
                    <Settings size={18} />
                    {wixSettings.apiKey && <span className="hidden md:inline font-medium">Wix Conectado</span>}
                 </button>
               )}
              <div className="hidden md:flex items-center gap-4 border-l pl-4 ml-2 border-gray-200">
                <a href="https://wix.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-ki-purple transition-colors">
                  <BookOpen size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Intro Section - Changes based on Tab */}
        <section className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ki-dark mb-4">
            {activeTab === 'blog' ? 'Generador de Contenido Holístico' : 'Viaje al Subconsciente'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {activeTab === 'blog' 
              ? 'Crea artículos profundos y sanadores para tu blog con el poder de la Inteligencia Artificial. Integrando Biodescodificación, Kinesiología y Cuántica.'
              : 'Explora tus bloqueos emocionales en esta aventura de texto interactiva generada procedimentalmente.'
            }
          </p>
        </section>

        {/* Tab Content */}
        {activeTab === 'blog' ? (
           <>
            {/* Control Panel */}
            <section className="max-w-3xl mx-auto glass-panel rounded-2xl p-6 shadow-lg mb-12">
              
              {/* Mode Selector */}
              <div className="mb-6 bg-gray-50 p-1.5 rounded-xl flex flex-col md:flex-row gap-1">
                 <button
                   onClick={() => setBlogMode('standard')}
                   className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                     blogMode === 'standard' ? 'bg-white text-ki-purple shadow' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Wand2 size={16} />
                   Estándar
                 </button>
                 <button
                   onClick={() => setBlogMode('news')}
                   className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                     blogMode === 'news' ? 'bg-white text-ki-teal shadow' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Newspaper size={16} />
                   Noticias & Tendencias
                 </button>
                 <button
                   onClick={() => setBlogMode('analysis')}
                   className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                     blogMode === 'analysis' ? 'bg-white text-ki-gold shadow' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <BarChart3 size={16} />
                   Clonar Éxito (URL)
                 </button>
              </div>

              {/* URL Input for Analysis Mode */}
              {blogMode === 'analysis' && (
                <div className="mb-4 animate-fade-in-up">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL del Artículo Exitoso (Referencia)
                  </label>
                  <div className="flex items-center gap-2 bg-white/50 border border-ki-gold/50 rounded-xl p-3 focus-within:ring-2 focus-within:ring-ki-gold">
                    <LinkIcon className="text-ki-gold" size={20} />
                    <input 
                      type="url"
                      placeholder="https://www.metodokifusion.com/blog..."
                      className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-1">
                    La IA analizará el estilo, tono y estructura de este enlace para replicar su éxito en el nuevo post.
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {blogMode === 'news' ? 'Tema de Búsqueda' : 'Tema del Nuevo Post'}
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-ki-purple focus:border-transparent outline-none transition-all bg-white/50 text-gray-700 resize-none h-24"
                  placeholder={
                    blogMode === 'news' ? "Ej: Últimos descubrimientos en epigenética..." :
                    blogMode === 'analysis' ? "Ej: Cómo superar la ansiedad (usando el estilo del link arriba)..." :
                    "Ej: Enfocarse en la ansiedad estacional..."
                  }
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                />
                
                {blogMode === 'news' && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                     <Globe size={16} className="mt-0.5 shrink-0"/>
                     <p>Buscando noticias recientes en la web...</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerateBlog}
                disabled={state.isLoading}
                className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-medium text-lg transition-all shadow-md
                  ${state.isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-ki-purple to-ki-teal hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                  }`}
              >
                {state.isLoading ? (
                  <>
                    <Spinner color="text-white" />
                    <span>
                      {blogMode === 'news' ? 'Buscando y Redactando...' : 
                       blogMode === 'analysis' ? 'Analizando URL y Escribiendo...' : 
                       'Canalizando contenido...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    <span>
                      {blogMode === 'analysis' ? 'Clonar Estilo y Generar' : 'Generar Artículo'}
                    </span>
                  </>
                )}
              </button>
              
              {state.error && (
                 <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                   {state.error}
                 </div>
              )}
            </section>

            {/* Results Area */}
            {state.data && (
              <div className="animate-fade-in-up space-y-12">
                
                {/* 1. Blog Post Viewer */}
                <div>
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-serif font-bold text-gray-800">Vista Previa del Artículo</h3>
                     
                     <div className="flex gap-2">
                        {/* Publish to Wix Button */}
                        <button 
                          onClick={handlePublishToWix}
                          disabled={isPublishing}
                          className="flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-full transition-colors shadow-lg disabled:opacity-50"
                        >
                          {isPublishing ? <Spinner color="text-white" /> : <UploadCloud size={16} />}
                          Publicar en Wix
                        </button>

                        <button 
                          onClick={() => navigator.clipboard.writeText(state.data!.content)}
                          className="flex items-center gap-2 text-sm font-medium text-ki-purple hover:bg-purple-50 px-4 py-2 rounded-full transition-colors"
                        >
                          <Download size={16} /> Copiar Texto
                        </button>
                     </div>
                   </div>
                   <BlogPostViewer data={state.data} />
                </div>

                {/* 2. Image Generation Section */}
                <div className="glass-panel p-8 rounded-2xl shadow-lg border-t-4 border-ki-gold">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ImageIcon className="text-ki-gold" />
                        Imagen de Portada
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Prompt Generado</p>
                        <p className="text-gray-700 italic font-medium leading-relaxed">"{state.data.imagePrompt}"</p>
                      </div>
                      
                      <button
                        onClick={handleGenerateImage}
                        disabled={state.isImageLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-ki-dark text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state.isImageLoading ? <Spinner color="text-white" /> : <Sparkles size={18} />}
                        <span>Generar Imagen con IA (Gemini Pro)</span>
                      </button>
                    </div>

                    <div className="w-full md:w-1/2 min-h-[300px] bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative group">
                      {state.isImageLoading && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
                          <Spinner color="text-ki-purple" />
                          <span className="text-sm font-medium text-gray-500">Materializando visión...</span>
                        </div>
                      )}
                      
                      {state.generatedImageUrl ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={state.generatedImageUrl} 
                            alt="Generated Art" 
                            className="w-full h-auto object-cover shadow-inner"
                          />
                          <a 
                            href={state.generatedImageUrl} 
                            download="kifusion-cover.png"
                            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:scale-110 transition-transform text-ki-dark"
                            title="Download"
                          >
                            <Download size={20} />
                          </a>
                        </div>
                      ) : (
                        <div className="text-center p-6 text-gray-400">
                          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                          <p>La visualización aparecerá aquí</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
           </>
        ) : (
           <AdventureGame initialTheme={customContext || "Sanando el Niño Interior"} />
        )}
      </main>

      {/* Wix Config Modal */}
      <WixConfigModal 
        isOpen={showWixModal} 
        onClose={() => setShowWixModal(false)}
        onSave={handleSaveWix}
        initialSettings={wixSettings}
      />

      <footer className="mt-20 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2024 Método KiFusion. Powered by Google Gemini.</p>
          <div className="flex gap-4">
            <span className="w-3 h-3 rounded-full bg-ki-purple opacity-50"></span>
            <span className="w-3 h-3 rounded-full bg-ki-teal opacity-50"></span>
            <span className="w-3 h-3 rounded-full bg-ki-gold opacity-50"></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
