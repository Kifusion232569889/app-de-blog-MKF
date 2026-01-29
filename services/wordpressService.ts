
import { BlogPost, WordPressSettings } from "../types";

const convertMarkdownToHtml = (markdown: string): string => {
  const blocks = markdown.split(/\n\n+/);
  
  const htmlBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    
    // Headers con ID para anclajes
    if (trimmed.startsWith('# ')) return `<h1>${trimmed.substring(2)}</h1>`;
    if (trimmed.startsWith('## ')) return `<h2 style="color: #4c1d95; margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${trimmed.substring(3)}</h2>`;
    if (trimmed.startsWith('### ')) return `<h3 style="color: #0d9488; margin-top: 30px;">${trimmed.substring(4)}</h3>`;
    
    // Listas con bullets limpios
    if (/^[\-\*]\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(line => line.trim()).map(line => {
        return line
          .replace(/^[\-\*]\s+/, '')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      });
      return `<ul style="margin-bottom: 20px; padding-left: 20px;">${items.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}</ul>`;
    }

    // Párrafos con espaciado profesional
    const content = trimmed
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
      
    return `<p style="line-height: 1.8; margin-bottom: 20px; font-size: 17px; color: #334155;">${content}</p>`;
  });

  return `<div class="kifusion-post-container">${htmlBlocks.join('')}</div>`;
};

export const publishToWordPress = async (post: BlogPost, settings: WordPressSettings) => {
  if (!settings.siteUrl || !settings.username || !settings.applicationPassword) {
    throw new Error("Configura las credenciales de WordPress en el panel de Ajustes.");
  }

  const baseUrl = settings.siteUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/wp-json/wp/v2/posts`;
  const htmlContent = convertMarkdownToHtml(post.content);
  const authHeader = btoa(`${settings.username}:${settings.applicationPassword}`);

  const payload = {
    title: post.title,
    content: htmlContent,
    status: "draft",
    format: "standard"
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authHeader}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WordPress error: ${errorData.message}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error al conectar con WordPress. Verifica la URL y el Application Password.");
  }
};
