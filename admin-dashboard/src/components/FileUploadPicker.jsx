import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Video, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export const FileUploadPicker = ({ 
  label, 
  accept = "image/*", 
  value, 
  onChange, 
  type = "image", // "image", "video", "file"
  folder = "general" // e.g. "question", "contest", "daily-contest", "category", "avatar"
}) => {
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
      setIsUploading(false);
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

  const clearFile = async () => {
    if (value && typeof value === 'string' && value.includes('/uploads/')) {
      try {
        await axios.delete('/api/upload', {
          data: { fileUrl: value },
          withCredentials: true
        });
      } catch (err) {
        console.warn('Could not delete file from server:', err);
      }
    }
    setFileName('');
    onChange('');
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      )}
      
      {/* Active Preview */}
      {value ? (
        <div className="relative rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80 backdrop-blur-md p-3 group transition-all duration-200 hover:border-slate-700">
          {type === 'image' && (
            <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80">
              <img src={value} alt="Preview" className="w-full h-40 object-cover rounded-xl transition-transform duration-300 group-hover:scale-102" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-xs text-white font-bold bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  Uploaded Image
                </span>
              </div>
            </div>
          )}

          {type === 'video' && (
            <video src={value} controls className="w-full h-40 rounded-xl bg-black border border-slate-800" />
          )}

          {type === 'file' && (
            <div className="flex items-center gap-3.5 p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{fileName || 'Uploaded Document'}</p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" /> Saved to uploads/{folder}/
                </span>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-white text-xs gap-2.5 z-10">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Uploading media...
            </div>
          )}

          {/* Clear button */}
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-4 right-4 p-1.5 bg-slate-950/80 hover:bg-rose-600 text-white rounded-full transition-all duration-150 shadow-lg border border-white/10 cursor-pointer z-20"
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
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10' 
              : 'border-slate-800 bg-slate-900/40 hover:border-emerald-500/50 hover:bg-slate-900/60'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-sm transition-transform duration-200 group-hover:scale-110">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {type === 'image' && <ImageIcon className="w-6 h-6" />}
                  {type === 'video' && <Video className="w-6 h-6" />}
                  {type === 'file' && <Upload className="w-6 h-6" />}
                </>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isUploading ? `Uploading file to uploads/${folder}/...` : <>Drag & drop file or <span className="text-emerald-400 underline">Browse File</span></>}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Saved into <code className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">public/uploads/{folder}/</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to persist pending Base64 image/media preview to public/uploads disk upon form save
export const uploadPendingFile = async (fileUrlOrBase64, folder = 'general') => {
  if (!fileUrlOrBase64 || typeof fileUrlOrBase64 !== 'string') return fileUrlOrBase64 || '';
  if (!fileUrlOrBase64.startsWith('data:')) return fileUrlOrBase64;

  try {
    const targetFolder = (folder || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const res = await axios.post('/api/upload/base64', {
      base64Data: fileUrlOrBase64,
      folder: targetFolder
    }, { withCredentials: true });

    if (res.data && res.data.fileUrl) {
      return res.data.fileUrl;
    }
  } catch (err) {
    console.warn('Failed to upload base64 file to server disk:', err);
  }
  return fileUrlOrBase64;
};

export default FileUploadPicker;
