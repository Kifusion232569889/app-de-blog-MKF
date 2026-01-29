
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BlogPost as BlogPostType } from '../types';
import { ChevronDown, ChevronUp, Edit3, Save, Sparkles } from 'lucide-react';

interface Props {
  data: BlogPostType;
  onUpdateContent: (newContent: string) => void;
}

const BlogPostViewer: React.FC<Props> = ({ data, onUpdateContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content);

  useEffect(() => {
    setEditableContent(data.content);
  }, [data.content]);

  const handleSaveEdit = () => {
    onUpdateContent(editableContent);
    setIsEditing(false);
  };

  const words = editableContent.trim().split(/\s+/);
  const isLongPost = words.length > 500;
  
  const contentToRender = (isLongPost && !isExpanded && !isEditing) 
    ? words.slice(0, 150).join(' ') + '...\n\n*(Continúa leyendo para descubrir el ejercicio de hoy)*' 
    : editableContent;

  return (
    <article className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden mb-12 border border-gray-100 relative group animate-fade-in">
      
      <div className="absolute top-6 right-6 z-20 flex gap-2">
         {isEditing ? (
            <button 
              onClick={handleSaveEdit}
              className="flex items-center gap-2 bg-ki-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-teal-600 transition-all scale-100 hover:scale-105"
            >
              <Save size={16} /> Guardar Cambios
            </button>
         ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white/90 backdrop-blur text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:text-ki-purple shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <Edit3 size={16} /> Refinar Contenido
            </button>
         )}
      </div>

      <div className="h-3 bg-gradient-to-r from-ki-purple via-ki-teal to-ki-gold"></div>
      
      <div className="p-10 md:p-16">
        {!isEditing && (
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-black text-ki-dark mb-6 leading-tight">
              {data.title}
            </h1>
            <div className="flex justify-center gap-4">
              <span className="h-1 w-12 bg-ki-teal rounded-full"></span>
              <Sparkles className="text-ki-gold animate-pulse" size={20} />
              <span className="h-1 w-12 bg-ki-teal rounded-full"></span>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="animate-fade-in-up">
            <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Editor de Sanación</label>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-[600px] p-8 bg-gray-50 border-2 border-ki-purple/10 rounded-3xl focus:border-ki-purple/30 focus:ring-0 outline-none font-mono text-sm leading-relaxed text-gray-800 resize-none shadow-inner"
              placeholder="Escribe la canalización aquí..."
            />
          </div>
        ) : (
          <>
            <div className="markdown-body prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h2 className="hidden" {...props} />,
                  h2: ({node, ...props}) => <h2 className="font-serif text-3xl font-bold text-ki-purple mt-12 mb-6 border-b-2 border-ki-teal/20 pb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="font-sans text-xl font-bold text-ki-teal mt-8 mb-4 flex items-center gap-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-6 text-lg leading-relaxed text-gray-600 font-light" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-8 border-ki-gold pl-8 py-6 my-10 bg-ki-gold/5 rounded-r-3xl italic text-ki-dark font-serif text-xl" {...props} />
                  ),
                  strong: ({node, ...props}) => <strong className="font-bold text-ki-purple" {...props} />,
                  li: ({node, ...props}) => <li className="mb-3 text-gray-600" {...props} />,
                }}
              >
                {contentToRender}
              </ReactMarkdown>
            </div>

            {isLongPost && (
              <div className="mt-12 flex justify-center relative">
                {!isExpanded && (
                  <div className="absolute -top-32 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-ki-dark text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-ki-purple hover:shadow-2xl shadow-xl z-10"
                >
                  {isExpanded ? (
                    <>
                      Contraer Artículo <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Ver Artículo Completo <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default BlogPostViewer;
