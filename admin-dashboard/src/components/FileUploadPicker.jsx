import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, CheckCircle } from 'lucide-react';

export const FileUploadPicker = ({ 
  label, 
  accept = "image/*", 
  value, 
  onChange, 
  type = "image" // "image", "video", "file"
}) => {
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result); // Base64 data URL for instant preview & submission
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFileName('');
    onChange('');
  };

  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      
      {/* Active Preview */}
      {value ? (
        <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-slate-900/60 p-3 group">
          {type === 'image' && (
            <div className="relative">
              <img src={value} alt="Preview" className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-white/10" />
            </div>
          )}

          {type === 'video' && (
            <video src={value} controls className="w-full h-36 rounded-xl bg-black" />
          )}

          {type === 'file' && (
            <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{fileName || 'Uploaded Document'}</p>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Ready for submission
                </span>
              </div>
            </div>
          )}

          {/* Clear button */}
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-all shadow-md"
            title="Remove File"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-brandPrimary bg-brandPrimary/10' 
              : 'border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-slate-900/30 hover:border-brandPrimary/60'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="p-2.5 bg-brandPrimary/10 rounded-xl text-brandPrimary">
              {type === 'image' && <ImageIcon className="w-5 h-5" />}
              {type === 'video' && <Video className="w-5 h-5" />}
              {type === 'file' && <Upload className="w-5 h-5" />}
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Drag & drop or <span className="text-brandPrimary underline">Browse File</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Supports {accept.replaceAll('/*', '')} up to 25MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadPicker;
