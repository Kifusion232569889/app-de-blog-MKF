
import React, { useState } from 'react';
import { BlogPost as BlogPostType } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Simple markdown renderer since we can't easily add heavy deps. 
// We will inject the content into a container with styles defined in index.html

interface Props {
  data: BlogPostType;
}

const BlogPostViewer: React.FC<Props> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Word count and truncation logic
  const words = data.content.trim().split(/\s+/);
  const wordCount = words.length;
  const isLongPost = wordCount > 500;

  // Determine what text to display
  const displayedContent = (isLongPost && !isExpanded) 
    ? words.slice(0, 500).join(' ') + '...' 
    : data.content;

  // Function to process markdown simply for the view
  // We use the CSS class 'markdown-content' defined in index.html to style standard HTML tags
  
  // Note: In a real production app, use a sanitizer library like DOMPurify before setting dangerouslySetInnerHTML
  // Since this content comes from Gemini (trusted source for this context), we will do a basic render.
  
  const parseMarkdown = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Lists
      .replace(/^\s*-\s+(.*)/gim, '<ul><li>$1</li></ul>') // Naive list implementation
      // Paragraphs (double newline)
      .replace(/\n\n/gim, '</p><p>')
      // Clean up adjacent ULs (optional, basic fix)
      .replace(/<\/ul>\s*<ul>/gim, '');
      
    return `<p>${html}</p>`;
  };

  return (
    <article className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-12 border border-gray-100">
      <div className="h-2 bg-gradient-to-r from-ki-purple via-ki-teal to-ki-gold"></div>
      <div className="p-8 md:p-12">
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(displayedContent) }}
        />

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
      </div>
    </article>
  );
};

export default BlogPostViewer;
