
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BlogPost as BlogPostType } from '../types';
import { ChevronDown, ChevronUp, Edit3, Save } from 'lucide-react';

interface Props {
  data: BlogPostType;
  onUpdateContent: (newContent: string) => void;
}

const BlogPostViewer: React.FC<Props> = ({ data, onUpdateContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content);

  // Sync internal state if parent data changes
  useEffect(() => {
    setEditableContent(data.content);
  }, [data.content]);

  const handleSaveEdit = () => {
    onUpdateContent(editableContent);
    setIsEditing(false);
  };

  // Logic to show "Read More" only if content is very long
  const words = editableContent.trim().split(/\s+/);
  const isLongPost = words.length > 500;
  
  // If not expanded and not editing, show truncate text
  // NOTE: For ReactMarkdown, we pass the full text if expanded, or a slice if not.
  // However, slicing markdown can break formatting (leaving unclosed tags). 
  // For a cleaner UI, we generally render full content but use CSS height masking, 
  // but to keep it simple and safe with the library:
  const contentToRender = (isLongPost && !isExpanded && !isEditing) 
    ? words.slice(0, 150).join(' ') + '...\n\n*(Continúa leyendo abajo)*' 
    : editableContent;

  return (
    <article className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-12 border border-gray-100 relative group">
      
      {/* Editor/Viewer Toggle */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
         {isEditing ? (
            <button 
              onClick={handleSaveEdit}
              className="flex items-center gap-2 bg-ki-teal text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-teal-600 transition-colors"
            >
              <Save size={16} /> Terminar Edición
            </button>
         ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white hover:text-ki-purple hover:shadow transition-all"
            >
              <Edit3 size={16} /> Editar Texto
            </button>
         )}
      </div>

      <div className="h-2 bg-gradient-to-r from-ki-purple via-ki-teal to-ki-gold"></div>
      
      <div className="p-8 md:p-12">
        {/* Explicit Title Rendering */}
        {!isEditing && (
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-ki-purple mb-8 leading-tight border-b pb-6 border-gray-100">
            {data.title}
          </h1>
        )}

        {isEditing ? (
          <div className="animate-fade-in-up">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Editor de Markdown</label>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-[600px] p-6 bg-gray-50 border-2 border-ki-purple/20 rounded-xl focus:border-ki-purple focus:ring-0 outline-none font-mono text-sm leading-relaxed text-gray-800 resize-none shadow-inner"
              placeholder="Escribe tu artículo aquí..."
            />
            <p className="mt-2 text-xs text-gray-400">
              Tips: Usa # para títulos, **negrita** para énfasis. Lo que escribas aquí es lo que se enviará a Wix.
            </p>
          </div>
        ) : (
          <>
            <div className="markdown-body text-gray-700 leading-relaxed space-y-6">
              <ReactMarkdown
                components={{
                  // Override specific elements to match KiFusion styling
                  h1: ({node, ...props}) => <h2 className="hidden" {...props} />, // Hide H1 in body since we render Title separately
                  h2: ({node, ...props}) => <h2 className="font-serif text-2xl font-bold text-ki-dark mt-8 mb-4 border-l-4 border-ki-teal pl-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="font-sans text-xl font-semibold text-teal-600 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-lg leading-8 font-light text-gray-700" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-6 text-gray-700" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-ki-purple" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-ki-gold pl-4 py-2 my-6 bg-yellow-50/50 italic text-gray-600" {...props} />,
                }}
              >
                {contentToRender}
              </ReactMarkdown>
            </div>

            {isLongPost && (
              <div className="mt-8 flex justify-center relative">
                {!isExpanded && (
                  <div className="absolute -top-24 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-ki-dark font-semibold transition-all hover:shadow-md z-10"
                >
                  {isExpanded ? (
                    <>
                      Leer menos <ChevronUp size={18} className="text-ki-purple group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  ) : (
                    <>
                      Leer el artículo completo <ChevronDown size={18} className="text-ki-purple group-hover:translate-y-0.5 transition-transform" />
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
