import React from 'react';
import { BlogPost as BlogPostType } from '../types';
import ReactMarkdown from 'react-markdown';

// Simple markdown renderer since we can't easily add heavy deps. 
// We will inject the content into a container with styles defined in index.html

interface Props {
  data: BlogPostType;
}

const BlogPostViewer: React.FC<Props> = ({ data }) => {
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
          dangerouslySetInnerHTML={{ __html: parseMarkdown(data.content) }}
        />
      </div>
    </article>
  );
};

export default BlogPostViewer;