import React from 'react';

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    // Very simple Markdown parsing for bold, italic, and links.
    let parsedLine = line;

    // Bold: **text**
    parsedLine = parsedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    parsedLine = parsedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // List items
    if (parsedLine.trim().startsWith('- ')) {
      parsedLine = `<li style="margin-left: 24px;">${parsedLine.trim().substring(2)}</li>`;
    }

    return <div key={index} dangerouslySetInnerHTML={{ __html: parsedLine || '<br/>' }} style={{ marginBottom: '8px', lineHeight: '1.6' }} />;
  };

  return (
    <div style={{ fontFamily: 'inherit', color: '#334155' }}>
      {lines.map(renderLine)}
    </div>
  );
}
