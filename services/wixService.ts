import { BlogPost, WixSettings } from "../types";

const WIX_API_URL = "https://www.wixapis.com/blog/v3/draft-posts";

// Helper to convert Markdown to HTML for Wix
// Handles headers, lists, and paragraphs more robustly than simple regex replacers
const convertMarkdownToHtml = (markdown: string): string => {
  // Split content by double newlines to separate blocks (headers, paragraphs, lists)
  const blocks = markdown.split(/\n\n+/);
  
  const htmlBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    
    // Headers
    if (trimmed.startsWith('# ')) return `<h1>${trimmed.substring(2)}</h1>`;
    if (trimmed.startsWith('## ')) return `<h2>${trimmed.substring(3)}</h2>`;
    if (trimmed.startsWith('### ')) return `<h3>${trimmed.substring(4)}</h3>`;
    
    // Lists (unordered) - starting with - or *
    if (/^[\-\*]\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(line => line.trim()).map(line => {
        // Remove bullet and process inline bold
        return line
          .replace(/^[\-\*]\s+/, '')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      });
      return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }

    // Regular Paragraphs
    const content = trimmed
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br>'); // Soft breaks
      
    return `<p>${content}</p>`;
  });

  return `<div>${htmlBlocks.join('')}</div>`;
};

export const publishToWix = async (post: BlogPost, settings: WixSettings) => {
  if (!settings.apiKey || !settings.siteId) {
    throw new Error("Faltan las credenciales de Wix. Configúralas primero.");
  }

  const htmlContent = convertMarkdownToHtml(post.content);

  const payload = {
    draftPost: {
      title: post.title,
      richContent: {
        nodes: [
          {
            type: "PARAGRAPH",
            id: "intro-node",
            nodes: [
              {
                type: "TEXT",
                id: "intro-text",
                nodes: [],
                textData: {
                  text: "Borrador generado con Método KiFusion AI.",
                  decorations: [{ type: "ITALIC", italicData: true }]
                }
              }
            ],
            paragraphData: {}
          },
          {
             type: "HTML",
             id: "content-node",
             nodes: [],
             htmlData: {
                containerData: {
                   width: { value: 100, unit: "%" },
                   alignment: "CENTER",
                   spoiler: {}
                },
                html: htmlContent,
                url: "" 
             }
          }
        ]
      }
    }
  };

  try {
    const response = await fetch(WIX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": settings.apiKey,
        "wix-site-id": settings.siteId
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Wix Error:", errorData);
      throw new Error(`Error de Wix (${response.status}): ${errorData.message || 'Verifica Site ID y API Key'}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error conectando con Wix");
  }
};
