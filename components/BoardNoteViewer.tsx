import React, { useMemo } from 'react';
import { BoardNote } from '../types';
import { Lightbulb, CheckCircle, Square, ArrowRight, ZoomIn, Image as ImageIcon, ChevronRight } from 'lucide-react';

interface Props {
  note: BoardNote;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}

export const BoardNoteViewer: React.FC<Props> = ({ note, isCompleted, onToggleComplete, onClose }) => {
  
  // PARSER ENGINE V4 (Premium UI + Block Tags)
  const parsedContent = useMemo(() => {
    if (!note.content) return [];
    
    // Split by tags. Note: Block tags capture the full content including closing tag.
    const parts = note.content.split(/(\[H1\]|\[INT\]|\[B\]|\[FIG\]|\[TIP\]|\[FLOW\][\s\S]*?\[\/FLOW\]|\[TABLE\][\s\S]*?\[\/TABLE\])/g);
    const elements: React.ReactNode[] = [];
    
    let currentTag = 'DEFAULT';

    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;

      // --- 1. HANDLE BLOCK TAGS ---
      
      // FLOWCHART ENGINE (Premium Style)
      if (trimmed.startsWith('[FLOW]') && trimmed.endsWith('[/FLOW]')) {
          const content = trimmed.replace('[FLOW]', '').replace('[/FLOW]', '').trim();
          const steps = content.split('>').map(s => s.trim());
          
          elements.push(
              <div key={index} className="my-10 overflow-x-auto pb-6 scrollbar-hide">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 min-w-max mx-auto px-2">
                      {steps.map((step, i) => (
                          <React.Fragment key={i}>
                              <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform opacity-50"></div>
                                  <div className="relative bg-white border border-slate-100 rounded-2xl px-8 py-5 font-bold text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center min-w-[140px] hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                        {step}
                                      </span>
                                  </div>
                              </div>
                              {i < steps.length - 1 && (
                                  <div className="text-slate-300">
                                      <ChevronRight size={28} className="rotate-90 md:rotate-0" />
                                  </div>
                              )}
                          </React.Fragment>
                      ))}
                  </div>
              </div>
          );
          return;
      }

      // TABLE ENGINE
      if (trimmed.startsWith('[TABLE]') && trimmed.endsWith('[/TABLE]')) {
          const content = trimmed.replace('[TABLE]', '').replace('[/TABLE]', '').trim();
          const rows = content.split('\n').filter(r => r.trim());
          if (rows.length === 0) return;

          elements.push(
              <div key={index} className="my-8 overflow-hidden rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-xs tracking-wider">
                              <tr>
                                  {rows[0].split('|').map((h, i) => (
                                      <th key={i} className="px-6 py-4 whitespace-nowrap border-b border-slate-100">{h.trim()}</th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {rows.slice(1).map((row, rIdx) => (
                                  <tr key={rIdx} className="bg-white hover:bg-slate-50/50 transition-colors">
                                      {row.split('|').map((cell, cIdx) => (
                                          <td key={cIdx} className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                                              {cell.trim()}
                                          </td>
                                      ))}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
          return;
      }

      // --- 2. HANDLE STANDARD TAGS ---
      if (['[H1]', '[INT]', '[B]', '[FIG]', '[TIP]'].includes(trimmed)) {
        currentTag = trimmed;
        return;
      }

      // --- 3. RENDER CONTENT ---
      switch (currentTag) {
        case '[H1]': // MAIN HEADING
          elements.push(
            <h1 key={index} className="text-3xl md:text-4xl font-black text-slate-900 mb-8 mt-10 tracking-tight leading-tight relative pl-4 border-l-4 border-blue-600">
              {trimmed}
            </h1>
          );
          break;
        
        case '[INT]': // INTRODUCTION (Glass Card)
          elements.push(
            <div key={index} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-8 mb-10 border border-indigo-100 shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lightbulb size={64} className="text-indigo-600" />
              </div>
              <p className="text-indigo-900 italic text-xl leading-loose font-medium relative z-10">
                  {trimmed}
              </p>
            </div>
          );
          break;

        case '[B]': // BODY (Bullets/Numbers)
            const lines = trimmed.split('\n').filter(l => l.trim());
            const listItems = lines.map((line, idx) => {
                const isNumbered = /^\d+\./.test(line.trim());
                const cleanLine = line.replace(/^\d+\.|^[-•]/, '').trim();
                
                // Bold parser: *text*
                const parts = cleanLine.split(/(\*.*?\*)/g);
                const renderedLine = parts.map((p, i) => {
                    if (p.startsWith('*') && p.endsWith('*')) {
                        return <strong key={i} className="text-slate-900 font-bold">{p.slice(1, -1)}</strong>;
                    }
                    return p;
                });

                return (
                    <li key={idx} className="mb-6 pl-4 text-slate-600 text-lg leading-loose flex gap-4 group">
                        <span className={`font-bold shrink-0 mt-1.5 w-6 h-6 flex items-center justify-center rounded-full text-xs ${isNumbered ? 'bg-slate-100 text-slate-600 group-hover:bg-slate-200' : 'text-blue-500'}`}>
                            {isNumbered ? line.split('.')[0] : '•'}
                        </span>
                        <span>{renderedLine}</span>
                    </li>
                );
            });
            elements.push(
                <ul key={index} className="mb-10 space-y-2">
                    {listItems}
                </ul>
            );
            break;

        case '[FIG]': // DIAGRAM (Assets Mapping)
          const diagramMatch = trimmed.match(/\[D(\d+)\]/i);
          if (diagramMatch) {
              const dId = diagramMatch[1];
              // Use Asset Path
              const imgUrl = `/assets/diagrams/d${dId}.png`;
              
              elements.push(
                <div key={index} className="my-10 group relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="bg-slate-50 aspect-video flex items-center justify-center relative overflow-hidden">
                        <img 
                            src={imgUrl} 
                            alt={`Diagram D${dId}`} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                                // Fallback if local asset missing
                                e.currentTarget.src = `https://placehold.co/800x500/f1f5f9/475569?text=Diagram+D${dId}`;
                            }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
                        <div className="absolute bottom-4 right-4 bg-white/90 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <ZoomIn size={14} /> Zoom View
                        </div>
                    </div>
                </div>
              );
          } else {
              elements.push(
                <div key={index} className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-8 mb-10 flex flex-col items-center text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                        <ImageIcon className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">{trimmed}</p>
                </div>
              );
          }
          break;

        case '[TIP]': // EXAM SECRET (Golden Card)
          elements.push(
            <div key={index} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-6 mb-10 border border-yellow-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600 shrink-0">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-900 text-sm uppercase tracking-wider mb-2">Board Exam Secret</h4>
                        <p className="text-yellow-900/80 font-medium text-lg leading-relaxed">{trimmed}</p>
                    </div>
                </div>
            </div>
          );
          break;

        default: // DEFAULT TEXT (Spacious)
          elements.push(
            <p key={index} className="mb-8 text-slate-600 text-lg leading-loose tracking-wide">
              {trimmed}
            </p>
          );
      }
    });

    return elements;
  }, [note.content]);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center z-10 shrink-0 sticky top-0">
        <div>
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-black uppercase text-white bg-gradient-to-r from-slate-800 to-slate-700 px-2 py-0.5 rounded tracking-widest shadow-sm">
                    BOARD SPECIAL
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded-full">{note.subject}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 truncate max-w-[200px] md:max-w-md leading-none tracking-tight">{note.title}</h2>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all border border-slate-100">
            <span className="text-xl font-bold">&times;</span>
        </button>
      </div>

      {/* CONTENT SCROLL */}
      <div className="flex-1 overflow-y-auto bg-white scroll-smooth">
         <div className="max-w-3xl mx-auto w-full p-6 md:p-10 pb-20">
             <div className="font-sans">
                 {parsedContent}
             </div>
         </div>
      </div>

      {/* FOOTER TRACKER */}
      <div className="border-t border-slate-100 p-4 bg-white/80 backdrop-blur-lg flex justify-center pb-8 shrink-0 absolute bottom-0 w-full">
          <button 
            onClick={onToggleComplete}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 w-full md:w-auto justify-center ${
                isCompleted 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white ring-4 ring-green-100' 
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
              {isCompleted ? <CheckCircle size={24} className="animate-bounce" /> : <Square size={24} />}
              <span className="text-lg font-bold tracking-tight">
                  {isCompleted ? 'Routine Completed!' : 'Mark as Completed'}
              </span>
          </button>
      </div>
    </div>
  );
};
