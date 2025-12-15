
import React, { useState, useEffect } from 'react';
import { Wand2, Download, Feather, BookOpen, ImageIcon, Info, Sparkles, Map, FileText, Newspaper, Globe, Link as LinkIcon, BarChart3, Settings, UploadCloud, History, Library, Trash2, Calendar, Edit2, ArrowRight, Save, CheckCircle2 } from 'lucide-react';
import { generateKiFusionPost, generateImageFromPrompt } from './services/geminiService';
import { publishToWix } from './services/wixService';
import { GenerationState, WixSettings, BlogPost } from './types';
import Spinner from './components/Spinner';
import BlogPostViewer from './components/BlogPost';
import AdventureGame from './components/AdventureGame';
import WixConfigModal from './components/WixConfigModal';

type ActiveTab = 'blog' | 'library' | 'game';
type BlogMode = 'standard' | 'news' | 'analysis';

interface PromptHistoryItem {
  context: string;
  mode: BlogMode;
  referenceUrl?: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('blog');
  const [blogMode, setBlogMode] = useState<BlogMode>('standard');
  const [customContext, setCustomContext] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  
  // History & Library State
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Wix State - LAZY INITIALIZATION (Fixes persistence issue)
  const [showWixModal, setShowWixModal] = useState(false);
  const [wixSettings, setWixSettings] = useState<WixSettings>(() => {
    try {
      const saved = localStorage.getItem('wixSettings');
      return saved ? JSON.parse(saved) : { apiKey: '', siteId: '' };
    } catch (e) {
      return { apiKey: '', siteId: '' };
    }
  });
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Blog State
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null, // This acts as the "Current Working Draft"
    generatedImageUrl: null,
    isImageLoading: false,
  });

  // Load persistence for History and Library
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('promptHistory');
      if (savedHistory) setPromptHistory(JSON.parse(savedHistory));

      const library = localStorage.getItem('savedPosts');
      if (library) setSavedPosts(JSON.parse(library));
    } catch (e) {
      console.error("Error loading persisted data", e);
    }
  }, []);

  const handleSaveWix = (settings: WixSettings) => {
    setWixSettings(settings);
    localStorage.setItem('wixSettings', JSON.stringify(settings));
  };

  // --- Library Logic ---
  const saveToLibrary = () => {
    if (!state.data) return;
    
    const newPost: BlogPost = {
      ...state.data,
      id: state.data.id || crypto.randomUUID(),
      createdAt: state.data.createdAt || Date.now(),
      imagePrompt: state.data.imagePrompt
    };

    // Check if updating existing
    const existingIndex = savedPosts.findIndex(p => p.id === newPost.id);
    let newLibrary;
    
    if (existingIndex >= 0) {
      newLibrary = [...savedPosts];
      newLibrary[existingIndex] = newPost;
    } else {
      newLibrary = [newPost, ...savedPosts];
    }

    setSavedPosts(newLibrary);
    localStorage.setItem('savedPosts', JSON.stringify(newLibrary));
    
    // Update current state ID
    setState(prev => ({ ...prev, data: newPost }));
    alert("Guardado en Biblioteca local.");
  };

  const deleteFromLibrary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Eliminar este borrador permanentemente?")) {
      const newLibrary = savedPosts.filter(p => p.id !== id);
      setSavedPosts(newLibrary);
      localStorage.setItem('savedPosts', JSON.stringify(newLibrary));
    }
  };

  const loadFromLibrary = (post: BlogPost) => {
    setState({
      isLoading: false,
      error: null,
      data: post,
      generatedImageUrl: null, // Reset image to force user to generate or keep placeholder? 
      // Ideally we would save the image URL too, but for this demo lets keep it simple.
      isImageLoading: false
    });
    setActiveTab('blog');
  };

  // --- Generation Logic ---

  const restoreFromHistory = (item: PromptHistoryItem) => {
    setCustomContext(item.context);
    setBlogMode(item.mode);
    setReferenceUrl(item.referenceUrl || '');
    setShowHistory(false);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('¿Estás seguro de borrar el historial?')) {
      setPromptHistory([]);
      localStorage.removeItem('promptHistory');
      setShowHistory(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (blogMode === 'analysis' && !referenceUrl) {
      alert("Por favor ingresa la URL del post que deseas analizar.");
      return;
    }

    // Save History
    if (customContext.trim()) {
      const newItem: PromptHistoryItem = {
        context: customContext,
        mode: blogMode,
        referenceUrl: blogMode === 'analysis' ? referenceUrl : undefined,
        timestamp: Date.now()
      };
      const newHistory = [newItem, ...promptHistory.filter(h => h.context !== newItem.context)].slice(0, 10);
      setPromptHistory(newHistory);
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
    }

    // 1. Start Text Generation
    setState(prev => ({ ...prev, isLoading: true, error: null, generatedImageUrl: null, data: null }));
    
    try {
      const data = await generateKiFusionPost(customContext, blogMode, referenceUrl);
      const dataWithId = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
      
      // 2. Update state with text data AND immediately start loading image
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        data: dataWithId,
        isImageLoading: true // Force loading state
      }));

      // 3. Automatically Generate Image (With Fallback)
      // If AI didn't provide a specific prompt, construct one from the title to ensure an image is ALWAYS made.
      const promptToUse = data.imagePrompt && data.imagePrompt.length > 10 
        ? data.imagePrompt 
        : `Spiritual and holistic abstract art representing: ${data.title}, ethereal lighting, 4k resolution, healing atmosphere`;

      try {
        const imageUrl = await generateImageFromPrompt(promptToUse);
        setState(prev => ({ ...prev, isImageLoading: false, generatedImageUrl: imageUrl }));
      } catch (imgErr) {
        console.error("Auto-image generation failed", imgErr);
        setState(prev => ({ ...prev, isImageLoading: false }));
      }

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isImageLoading: false,
        error: err.message || "Error al generar el contenido." 
      }));
    }
  };

  const handleUpdateContent = (newContent: string) => {
    setState(prev => {
       if(!prev.data) return prev;
       return {
         ...prev,
         data: { ...prev.data, content: newContent }
       };
    });
  };

  const handleGenerateImage = async () => {
    // Manual trigger backup
    const prompt = state.data?.imagePrompt || `Abstract healing art for: ${state.data?.title}`;
    
    setState(prev => ({ ...prev, isImageLoading: true }));
    try {
      const imageUrl = await generateImageFromPrompt(prompt);
      setState(prev => ({ ...prev, isImageLoading: false, generatedImageUrl: imageUrl }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isImageLoading: false, error: "Error generando la imagen." }));
    }
  };

  const handlePublishToWix = async () => {
    if (!state.data) return;
    
    // Check credentials immediately
    if (!wixSettings.apiKey || !wixSettings.siteId) {
      setShowWixModal(true);
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishToWix(state.data, wixSettings);
      alert("¡PUBLICADO! \n\nEl artículo se ha enviado a Wix. \nPuedes encontrarlo en tu panel: Blog > Borradores.");
    } catch (error: any) {
      console.error(error);
      if(error.message.includes("401") || error.message.includes("403")) {
          alert("Error de permisos. Tus credenciales de Wix parecen inválidas. Por favor revísalas.");
          setShowWixModal(true);
      } else {
          alert("Error al publicar: " + error.message);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-ki-dark">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ki-purple to-ki-teal flex items-center justify-center text-white shadow-md">
                <Feather size={20} />
              </div>
              <h1 className="text-2xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-ki-purple to-ki-teal hidden md:block">
                Método KiFusion
              </h1>
            </div>
            
            {/* Nav Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner">
                <button 
                   onClick={() => setActiveTab('blog')}
                   className={`px-3 md:px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'blog' ? 'bg-white shadow text-ki-purple transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <div className="flex items-center gap-2">
                      <Edit2 size={16} />
                      <span className="">Editor</span>
                   </div>
                </button>
                <button 
                   onClick={() => setActiveTab('library')}
                   className={`px-3 md:px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'library' ? 'bg-white shadow text-ki-gold transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <div className="flex items-center gap-2">
                      <Library size={16} />
                      <span className="">Biblioteca</span>
                      {savedPosts.length > 0 && <span className="ml-1 bg-ki-gold text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{savedPosts.length}</span>}
                   </div>
                </button>
                <button 
                   onClick={() => setActiveTab('game')}
                   className={`px-3 md:px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'game' ? 'bg-white shadow text-ki-teal transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <div className="flex items-center gap-2">
                      <Map size={16} />
                      <span className="hidden sm:inline">Viaje</span>
                   </div>
                </button>
            </div>
            
            <div className="flex items-center gap-2">
               {activeTab !== 'game' && (
                 <button 
                    onClick={() => setShowWixModal(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        wixSettings.apiKey 
                        ? 'text-teal-700 bg-teal-50 border border-teal-200 shadow-sm' 
                        : 'text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    title="Configurar Wix"
                 >
                    <Settings size={18} />
                    {wixSettings.apiKey ? (
                        <span className="hidden lg:flex items-center gap-1"><CheckCircle2 size={14} className="text-teal-600"/> Wix Conectado</span>
                    ) : (
                        <span className="hidden lg:inline">Conectar Wix</span>
                    )}
                 </button>
               )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Intro Section */}
        <section className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-ki-dark mb-4">
            {activeTab === 'blog' ? 'Generador & Editor' : 
             activeTab === 'library' ? 'Tu Biblioteca de Sanación' :
             'Viaje al Subconsciente'}
          </h2>
        </section>

        {/* --- LIBRARY TAB --- */}
        {activeTab === 'library' && (
           <div className="animate-fade-in-up">
              {savedPosts.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                   <Library size={64} className="mx-auto text-gray-300 mb-6" />
                   <h3 className="text-2xl font-bold text-gray-600 mb-2">Tu biblioteca está vacía</h3>
                   <p className="text-gray-500 mb-8 max-w-md mx-auto">Tus artículos guardados aparecerán aquí para que puedas editarlos o publicarlos más tarde.</p>
                   <button onClick={() => setActiveTab('blog')} className="px-8 py-4 bg-gradient-to-r from-ki-purple to-ki-teal text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      Crear Primer Artículo
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {savedPosts.map((post) => (
                      <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow flex flex-col group">
                         <div className="h-32 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative border-b border-gray-100">
                            <FileText className="text-ki-purple w-12 h-12 opacity-50 group-hover:scale-110 transition-transform" />
                            <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 font-mono bg-white px-2 py-1 rounded shadow-sm">
                               {new Date(post.createdAt || 0).toLocaleDateString()}
                            </div>
                         </div>
                         <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-serif font-bold text-xl text-gray-800 mb-3 line-clamp-2 leading-tight">{post.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                               {post.content.replace(/[#*]/g, '').slice(0, 150)}...
                            </p>
                            <div className="flex gap-2 mt-auto">
                               <button 
                                 onClick={() => loadFromLibrary(post)}
                                 className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                               >
                                 <Edit2 size={14} /> Abrir Editor
                               </button>
                               <button 
                                 onClick={(e) => deleteFromLibrary(post.id!, e)}
                                 className="px-3 py-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                 title="Eliminar"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>
        )}

        {/* --- BLOG GENERATOR TAB --- */}
        {activeTab === 'blog' && (
           <>
            {/* Control Panel */}
            <section className="max-w-3xl mx-auto glass-panel rounded-2xl p-6 shadow-xl shadow-purple-900/5 mb-12 border border-white/60">
              
              {/* Mode Selector */}
              <div className="mb-6 bg-gray-100/50 p-1.5 rounded-xl flex flex-col md:flex-row gap-1">
                 <button
                   onClick={() => setBlogMode('standard')}
                   className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                     blogMode === 'standard' ? 'bg-white text-ki-purple shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Wand2 size={16} />
                   Estándar
                 </button>
                 <button
                   onClick={() => setBlogMode('news')}
                   className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                     blogMode === 'news' ? 'bg-white text-ki-teal shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Newspaper size={16} />
                   Noticias
                 </button>
                 <button
                   onClick={() => setBlogMode('analysis')}
                   className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                     blogMode === 'analysis' ? 'bg-white text-ki-gold shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <BarChart3 size={16} />
                   Clonar Estilo
                 </button>
              </div>

              {/* URL Input */}
              {blogMode === 'analysis' && (
                <div className="mb-4 animate-fade-in-up">
                  <div className="flex items-center gap-2 bg-white/50 border border-ki-gold/50 rounded-xl p-3 focus-within:ring-2 focus-within:ring-ki-gold shadow-sm">
                    <LinkIcon className="text-ki-gold" size={20} />
                    <input 
                      type="url"
                      placeholder="Pega aquí la URL del artículo que quieres imitar..."
                      className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="mb-6 relative">
                {/* History Dropdown */}
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">¿Sobre qué quieres escribir hoy?</label>
                  {promptHistory.length > 0 && (
                    <div className="relative">
                      <button onClick={() => setShowHistory(!showHistory)} className="text-xs flex items-center gap-1 text-ki-purple font-bold bg-purple-50 px-2.5 py-1 rounded-md hover:bg-purple-100 transition-colors">
                        <History size={14} /> Historial
                      </button>
                      {showHistory && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 overflow-hidden animate-fade-in-up">
                          <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">ÚLTIMOS TEMAS</span>
                            <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 underline">Borrar todo</button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {promptHistory.map((item, idx) => (
                              <button key={idx} onClick={() => restoreFromHistory(item)} className="w-full text-left p-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0 group">
                                <div className="text-[10px] text-gray-400 flex justify-between mb-1">
                                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                    <span className={`font-bold uppercase px-1 rounded ${item.mode === 'news' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>{item.mode}</span>
                                </div>
                                <span className="group-hover:text-ki-purple transition-colors">{item.context}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <textarea
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-ki-purple focus:border-transparent outline-none transition-all bg-white/50 text-gray-700 resize-none h-24 shadow-inner text-lg placeholder:text-base placeholder:font-light"
                  placeholder={
                    blogMode === 'news' ? "Ej: Busca tendencias sobre epigenética y emociones..." :
                    blogMode === 'analysis' ? "Ej: Escribe sobre ansiedad usando el estilo del link..." :
                    "Ej: Dolor de rodilla derecha y su relación con el ego..."
                  }
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                />
              </div>

              <button
                onClick={handleGenerateBlog}
                disabled={state.isLoading}
                className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl
                  ${state.isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-ki-purple to-ki-teal hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {state.isLoading ? (
                  <>
                    <Spinner color="text-white" />
                    <span>Redactando Artículo + Generando Imagen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    <span>{state.data ? 'Generar Nuevo (Sobreescribir)' : 'Generar Borrador Completo'}</span>
                  </>
                )}
              </button>
              
              {state.error && (
                 <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100 flex items-center justify-center gap-2">
                   <Info size={16} /> {state.error}
                 </div>
              )}
            </section>

            {/* Editor & Actions Area */}
            {state.data && (
              <div className="animate-fade-in-up space-y-8">
                
                {/* Action Bar (Sticky) */}
                <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 sticky top-24 z-30 shadow-xl border-t border-white/50 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <div>
                           <span className="text-sm font-bold text-gray-800 block">Borrador Listo para Revisión</span>
                           <span className="text-xs text-gray-500 hidden md:block">Edita abajo si es necesario y luego publica.</span>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={saveToLibrary}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-semibold hover:border-gray-300"
                        >
                          <Save size={18} /> <span className="hidden sm:inline">Guardar en Biblioteca</span>
                        </button>
                        <button 
                          onClick={handlePublishToWix}
                          disabled={isPublishing}
                          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-white rounded-lg transition-all shadow-lg font-bold disabled:opacity-70 disabled:cursor-not-allowed
                            ${isPublishing ? 'bg-gray-800' : 'bg-black hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5'}
                          `}
                        >
                          {isPublishing ? <Spinner color="text-white" /> : <UploadCloud size={18} />}
                          <span>{isPublishing ? 'Publicando...' : 'Publicar en Wix'}</span>
                        </button>
                    </div>
                </div>

                {/* 1. Blog Post Viewer / Editor */}
                <div>
                   <BlogPostViewer data={state.data} onUpdateContent={handleUpdateContent} />
                </div>

                {/* 2. Image Generation Section */}
                <div className="glass-panel p-8 rounded-2xl shadow-lg border-t-4 border-ki-gold bg-white/60">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ImageIcon className="text-ki-gold" />
                        Imagen de Portada
                      </h3>
                      <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 shadow-inner">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Prompt Utilizado</p>
                        <p className="text-gray-700 italic font-medium leading-relaxed text-sm">
                          "{state.data.imagePrompt || `Auto-generado: ${state.data.title}`}"
                        </p>
                      </div>
                      
                      <button
                        onClick={handleGenerateImage}
                        disabled={state.isImageLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                      >
                        {state.isImageLoading ? <Spinner color="text-ki-purple" /> : <Sparkles size={18} className="text-ki-purple" />}
                        <span>Regenerar Imagen (Si no te gusta)</span>
                      </button>
                    </div>

                    <div className="w-full md:w-1/2 min-h-[350px] bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative group shadow-inner">
                      {state.isImageLoading && (
                        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                          <Spinner color="text-ki-purple" />
                          <span className="text-sm font-bold text-gray-500 animate-pulse">Materializando visión cuántica...</span>
                        </div>
                      )}
                      
                      {state.generatedImageUrl ? (
                        <div className="relative w-full h-full group">
                          <img 
                            src={state.generatedImageUrl} 
                            alt="Generated Art" 
                            className="w-full h-full object-cover shadow-sm transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <a 
                               href={state.generatedImageUrl} 
                               download="kifusion-cover.png"
                               className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                             >
                               <Download size={18} /> Descargar HD
                             </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 text-gray-400">
                          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                          <p>La visualización aparecerá aquí automáticamente</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
           </>
        )}
        
        {activeTab === 'game' && (
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
    </div>
  );
};

export default App;
