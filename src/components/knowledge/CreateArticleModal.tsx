import React, { useState, useRef } from 'react';
import styles from './CreateArticleModal.module.css';
import { api } from '@/lib/api';

export function CreateArticleModal({ onClose, onSuccess, dict }: any) {
  const [activeTab, setActiveTab] = useState<'ru' | 'en'>('ru');
  
  const [titleRu, setTitleRu] = useState('');
  const [titleEn, setTitleEn] = useState('');
  
  const [descRu, setDescRu] = useState('');
  const [descEn, setDescEn] = useState('');
  
  const [linksRu, setLinksRu] = useState([{ title: '', url: '' }]);
  const [linksEn, setLinksEn] = useState([{ title: '', url: '' }]);
  
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentLinks = activeTab === 'ru' ? linksRu : linksEn;
  const setCurrentLinks = activeTab === 'ru' ? setLinksRu : setLinksEn;

  const handleAddLink = () => {
    setCurrentLinks([...currentLinks, { title: '', url: '' }]);
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...currentLinks];
    newLinks[index][field] = value;
    setCurrentLinks(newLinks);
  };

  const insertMarkdown = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const desc = activeTab === 'ru' ? descRu : descEn;
    const setDesc = activeTab === 'ru' ? setDescRu : setDescEn;

    const selectedText = desc.substring(start, end);
    const newText = desc.substring(0, start) + prefix + selectedText + suffix + desc.substring(end);
    setDesc(newText);
    
    // Restore focus and cursor position after state updates
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!titleRu.trim() || !descRu.trim() || !titleEn.trim() || !descEn.trim()) {
      alert('Please fill in both RU and EN titles and descriptions.');
      return;
    }
    setSubmitting(true);
    try {
      // Filter out empty links
      const validLinksRu = linksRu.filter(l => l.title.trim() && l.url.trim());
      const validLinksEn = linksEn.filter(l => l.title.trim() && l.url.trim());
      
      await api.post('/knowledge', { 
        titleRu, 
        titleEn, 
        descriptionRu: descRu, 
        descriptionEn: descEn, 
        linksRu: validLinksRu,
        linksEn: validLinksEn 
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      alert('Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{dict?.create_article || 'Create Article'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'ru' ? styles.tabActive : ''}`} 
            onClick={() => setActiveTab('ru')}
          >
            RU (Русский)
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'en' ? styles.tabActive : ''}`} 
            onClick={() => setActiveTab('en')}
          >
            EN (English)
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>{dict?.title || 'Title'} ({activeTab.toUpperCase()})</label>
            <input 
              className={styles.input} 
              value={activeTab === 'ru' ? titleRu : titleEn} 
              onChange={e => activeTab === 'ru' ? setTitleRu(e.target.value) : setTitleEn(e.target.value)} 
              placeholder={dict?.title_placeholder || 'Enter article title...'}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>{dict?.description || 'Description'} ({activeTab.toUpperCase()}) (Markdown supported)</label>
            <div className={styles.toolbar}>
              <button className={styles.toolbarBtn} onClick={() => insertMarkdown('**', '**')} title="Bold">B</button>
              <button className={styles.toolbarBtn} style={{ fontStyle: 'italic' }} onClick={() => insertMarkdown('*', '*')} title="Italic">I</button>
              <button className={styles.toolbarBtn} onClick={() => insertMarkdown('- ', '')} title="List Item">• List</button>
            </div>
            <textarea 
              ref={textareaRef}
              className={styles.textarea} 
              value={activeTab === 'ru' ? descRu : descEn} 
              onChange={e => activeTab === 'ru' ? setDescRu(e.target.value) : setDescEn(e.target.value)} 
              placeholder="**Bold**, *italic*, - list items..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>{dict?.links || 'Links'} ({activeTab.toUpperCase()}) (Optional)</label>
            {currentLinks.map((link, idx) => (
              <div key={idx} className={styles.linkRow}>
                <input 
                  className={styles.input} 
                  style={{ flex: 1 }}
                  placeholder="Link Title" 
                  value={link.title} 
                  onChange={e => handleLinkChange(idx, 'title', e.target.value)} 
                />
                <input 
                  className={styles.input} 
                  style={{ flex: 2 }}
                  placeholder="https://..." 
                  value={link.url} 
                  onChange={e => handleLinkChange(idx, 'url', e.target.value)} 
                />
              </div>
            ))}
            <button className={styles.addLinkBtn} onClick={handleAddLink}>
              + {dict?.add_link || 'Add another link'}
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            {dict?.cancel || 'Cancel'}
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting || !titleRu || !descRu || !titleEn || !descEn}>
            {submitting ? 'Saving...' : (dict?.save || 'Save Article')}
          </button>
        </div>
      </div>
    </div>
  );
}
