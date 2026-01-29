
import React, { useState } from 'react';
import { Wand2, Feather, Sparkles, Save, ImageIcon, Settings, Layout, Globe, BookOpen, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { generateKiFusionPost, generateImageFromPrompt } from './services/geminiService';
import { publishToWordPress } from './services/wordpressService';
import { GenerationState, WordPressSettings, BlogPost, ImageStyle, ImageSize } from './types';
import Spinner from './components/Spinner';
import BlogPostViewer from './components/BlogPost';
import WordPressConfigModal from './components/WordPressConfigModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
  const [customContext, setCustomContext] = useState('');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('cinematic');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);

  const [wpSettings, setWpSettings] = useState<WordPressSettings>(() => {
    try {
      const saved = localStorage.getItem('wordpressSettings');
      return saved ? JSON.parse(saved) : { siteUrl: '', username: '', applicationPassword: '' };
    } catch { return { siteUrl: '', username: '', applicationPassword: '' }; }
  });

  const [savedPosts, setSavedPosts] = useState<BlogPost[]>(() => {
    try {
      const lib = localStorage.getItem('savedPosts');
      return lib ? JSON.parse(lib) : [];
    } catch { return []; }
  });

  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null,
    generatedImageUrl: null,
    isImageLoading: false,
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleGenerateFull = async () => {
    setState({ 
      isLoading: true, 
      error: null, 
      data: null, 
      generatedImageUrl: null, 
      isImageLoading: false 
    });
    setSources([]);

    try {
      const result = await generateKiFusionPost(customContext);
      const dataWithId = { ...result, id: crypto.randomUUID(), createdAt: Date.now() };
      setSources(result.sources || []);
      setState(prev => ({ ...prev, isLoading: false, data: dataWithId, isImageLoading: true }));

      try {
        const imageUrl = await generateImageFromPrompt(result.imagePrompt, imageStyle, imageSize);
        setState(prev => ({ ...prev, isImageLoading: false, generatedImageUrl: imageUrl }));
      } catch (imgErr) {
        setState(prev => ({ ...prev, isImageLoading: false }));
      }

    } catch (err: any) {
      if (err.message?.includes("API KEY") || err.message?.includes("entity was not found")) {
        const studio = (window as any).aistudio;
        if (studio) studio.openSelectKey();
      }
      setState({ 
        isLoading: false, 
        isImageLoading: false, 
        error: err.message || "Error al conectar.",
        data: null,
        generatedImageUrl: null
      });
    }
  };

  const handlePublish = async () => {
    if (!state.data) return;
    if (!wpSettings.siteUrl) return setShowConfigModal(true);
    setIsPublishing(true);
    try {
      await publishToWordPress(state.data, wpSettings);
      alert("¡Publicado!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!state.data) return;
    const newLib = [state.data, ...savedPosts.filter(p => p.id !== state.data?.id)].slice(0, 50);
    setSavedPosts(newLib);
    localStorage.setItem('savedPosts', JSON.stringify(newLib));
    alert("Guardado.");
  };

  return (
    <div className="min-h-screen font-sans text-ki-dark bg-[#fdfdff]">
      <header className="fixed top-0 w-full z-50 glass-panel shadow-sm h-16 flex items-center px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ki-purple to-ki-teal flex items-center justify-center text-white shadow-lg rotate-3">
            <Feather size={20} />
          </div>
          <h1 className="text-xl font-serif font-bold text-ki-purple tracking-tight">KiFusion Studio</h1>
        </div>
        
        <nav className="flex bg-gray-100/60 p-1 rounded-xl border border-gray-200">
          <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-8 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-white shadow-sm text-ki-purple' : 'text-gray-400 hover:text-ki-purple'}`}>
            <Layout size={14} /> Estudio
          </button>
          <button onClick={() => setActiveTab('library')} className={`flex items-center gap-2 px-8 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-white shadow-sm text-ki-gold' : 'text-gray-400 hover:text-ki-gold'}`}>
            <BookOpen size={14} /> Biblioteca
          </button>
        </nav>

        <button onClick={() => setShowConfigModal(true)} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-ki-purple">
          <Settings size={20} />
        </button>
      </header>

      <main className="pt-20 pb-8 px-6 max-w-[1800px] mx-auto">
        {activeTab === 'editor' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center h-[calc(100vh-120px)]">
            
            {/* PANEL IZQUIERDO: CANALIZADOR (ANCHO 50% y CORTO) */}
            <section className="w-full lg:w-1/2 h-full">
              <div className="glass-panel p-6 rounded-[2rem] shadow-xl border border-white bg-white/95 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <Wand2 size={24} className="text-ki-purple" />
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Canalizador de Sanación</h2>
                </div>
                
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1 min-h-0">
                    <label className="text-[10px] font-black text-ki-purple uppercase mb-2 block tracking-widest">Conflicto o Síntoma</label>
                    <textarea
                      className="w-full h-full p-6 rounded-2xl border-2 border-gray-100 bg-gray-50/50 outline-none text-xl shadow-inner resize-none focus:border-ki-purple/40 focus:bg-white transition-all leading-relaxed placeholder:italic placeholder:text-gray-300"
                      placeholder="Escribe aquí o genera una canalización espontánea..."
                      value={customContext}
                      onChange={(e) => setCustomContext(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vibración Artística</label>
                      <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyle)} className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-white font-bold text-gray-700 outline-none focus:border-ki-purple">
                        <option value="cinematic">Cinematográfico</option>
                        <option value="abstract">Energético</option>
                        <option value="zen">Realismo Zen</option>
                        <option value="anatomical">Anatomía Sagrada</option>
                        <option value="watercolor">Acuarela</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Calidad Portada</label>
                      <select value={imageSize} onChange={(e) => setImageSize(e.target.value as ImageSize)} className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-white font-bold text-gray-700 outline-none focus:border-ki-purple">
                        <option value="1K">1K (Web)</option>
                        <option value="2K">2K (HD)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateFull}
                    disabled={state.isLoading}
                    className="w-full py-5 bg-gradient-to-r from-ki-purple via-ki-purple to-ki-teal text-white font-black rounded-xl shadow-lg hover:shadow-ki-purple/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-base uppercase tracking-widest"
                  >
                    {state.isLoading ? <Spinner color="text-white" /> : <Sparkles size={20} />}
                    {state.isLoading ? 'CONECTANDO...' : 'CANALIZAR AHORA'}
                  </button>

                  {state.error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-tight font-bold uppercase">{state.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* PANEL DERECHO: RESULTADOS */}
            <section className="w-full lg:w-1/2 h-full overflow-y-auto pr-2 space-y-6">
              {state.data ? (
                <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4 bg-white/60 p-3 rounded-xl border border-white shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1 bg-ki-teal/10 rounded-lg text-ki-teal text-[9px] font-black uppercase">
                      <Globe size={12} /> Grounding Activo
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveToLibrary} className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-2 shadow-sm">
                        <Save size={14} /> Guardar
                      </button>
                      <button onClick={handlePublish} disabled={isPublishing} className="bg-[#21759b] text-white px-5 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-2 shadow-md">
                        {isPublishing ? <Spinner color="text-white" /> : <Globe size={14} />}
                        WordPress
                      </button>
                    </div>
                  </div>

                  <BlogPostViewer data={state.data} onUpdateContent={(c) => setState(prev => ({...prev, data: {...prev.data!, content: c}}))} />

                  <div className="glass-panel p-8 rounded-[2rem] shadow-lg border-t-8 border-ki-gold bg-white relative overflow-hidden mt-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif font-bold text-2xl text-ki-dark flex items-center gap-3">
                        <ImageIcon size={28} className="text-ki-gold" /> Portada
                      </h3>
                      <button onClick={handleGenerateFull} className="p-2 text-ki-purple bg-ki-purple/5 rounded-full hover:rotate-180 transition-all">
                        <RefreshCw size={18}/>
                      </button>
                    </div>

                    <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden relative border-4 border-dashed border-gray-100 flex items-center justify-center group">
                      {state.isImageLoading ? (
                        <div className="flex flex-col items-center gap-4">
                          <Spinner color="text-ki-purple" />
                          <p className="text-[10px] font-black text-gray-400 animate-pulse uppercase">Materializando...</p>
                        </div>
                      ) : state.generatedImageUrl ? (
                        <img src={state.generatedImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[6s]" alt="Sanación" />
                      ) : (
                        <ImageIcon size={60} className="text-gray-200" />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-8 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                  <Feather size={100} className="text-ki-purple animate-pulse" />
                  <div className="space-y-2">
                    <p className="text-3xl font-serif font-bold text-ki-dark">Estudio KiFusion</p>
                    <p className="max-w-xs mx-auto text-sm">Tu espacio para la creación de contenido de sanación profunda.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto animate-fade-in">
            {savedPosts.map(post => (
              <div key={post.id} className="bg-white p-8 rounded-[2rem] shadow-md border border-gray-100 flex flex-col hover:border-ki-purple transition-all group">
                <span className="text-[9px] text-gray-400 font-bold mb-3">{new Date(post.createdAt || 0).toLocaleDateString()}</span>
                <h3 className="font-serif font-bold text-2xl mb-4 text-ki-dark group-hover:text-ki-purple transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-3 mb-6 leading-relaxed italic flex-1">"{post.content.slice(0, 150)}..."</p>
                <button onClick={() => { setState({ ...state, data: post }); setActiveTab('editor'); }} className="w-full py-3 bg-gray-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-ki-purple transition-all">
                   Cargar Canalización
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <WordPressConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
        onSave={(s) => { setWpSettings(s); localStorage.setItem('wordpressSettings', JSON.stringify(s)); }} 
        initialSettings={wpSettings} 
      />
    </div>
  );
};

export default App;
