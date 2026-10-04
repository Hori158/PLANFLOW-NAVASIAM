import React from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface PhotoViewModalProps {
  url: string | null;
  title?: string;
  onClose: () => void;
}

export const PhotoViewModal: React.FC<PhotoViewModalProps> = ({ url, title, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 text-white animate-pop">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/90 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm truncate max-w-md">
              {title || 'ภาพถ่ายหลักฐานผลงานการปฏิบัติงาน'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="เปิดภาพในแท็บใหม่"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-4 bg-black/40 flex items-center justify-center min-h-[300px] max-h-[75vh]">
          <img 
            src={url} 
            alt={title || 'หลักฐาน'} 
            className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-lg"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-800/60 border-t border-slate-700 text-xs text-slate-400 flex items-center justify-between">
          <span>หลักฐานบันทึกจาก AppSheet Mobile / Cloud Drive</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium cursor-pointer"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
