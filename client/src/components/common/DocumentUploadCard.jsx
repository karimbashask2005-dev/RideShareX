import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

const DocumentUploadCard = ({ 
  title, 
  description, 
  onUploadComplete, 
  uploadedUrl, 
  docNumber, 
  onDocNumberChange,
  numberPlaceholder = "Enter Document Number",
  status = "none", // none, pending, verified, rejected
  rejectionReason = "",
  required = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateUpload = (name) => {
    setIsUploading(true);
    setUploadProgress(0);
    setFileName(name);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Return a mock document/image URL (using high quality placeholder images for realistic looks)
          const mockUrls = [
            'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'
          ];
          const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
          onUploadComplete(randomUrl);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0].name);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0].name);
    }
  };

  const handleRemove = () => {
    setFileName("");
    setUploadProgress(0);
    onUploadComplete("");
  };

  return (
    <div className={`p-6 bg-slate-900 border rounded-2xl transition-all duration-300 ${
      status === 'verified' ? 'border-emerald-500/30 bg-emerald-950/5' :
      status === 'rejected' ? 'border-rose-500/30 bg-rose-950/5' :
      status === 'pending' ? 'border-amber-500/30 bg-amber-950/5' :
      'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Title & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
            {title}
            {required && <span className="text-rose-500 text-xs">*</span>}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        
        {status === 'verified' && (
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            Verified
          </span>
        )}
        {status === 'pending' && (
          <span className="px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
            Pending Approval
          </span>
        )}
        {status === 'rejected' && (
          <span className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
            Rejected
          </span>
        )}
      </div>

      {/* Rejection Alert */}
      {status === 'rejected' && rejectionReason && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-400 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Reason for rejection:</span> {rejectionReason}
          </div>
        </div>
      )}

      {/* Document Number Input */}
      {onDocNumberChange && status !== 'verified' && status !== 'pending' && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Document ID Number
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder={numberPlaceholder}
            value={docNumber}
            onChange={(e) => onDocNumberChange(e.target.value)}
          />
        </div>
      )}

      {onDocNumberChange && (status === 'verified' || status === 'pending') && docNumber && (
        <div className="mb-4 p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-slate-300 text-sm">
          <span className="text-xs text-slate-500 block mb-0.5">Document Number</span>
          <span className="font-mono tracking-wider">{docNumber}</span>
        </div>
      )}

      {/* Upload area */}
      {status !== 'verified' && status !== 'pending' ? (
        !uploadedUrl ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 relative overflow-hidden ${
              dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3"></div>
                <p className="text-sm font-medium text-slate-300">Uploading to Cloudinary...</p>
                <div className="w-40 bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                <UploadCloud className="h-10 w-10 text-slate-500 mb-2.5 group-hover:text-indigo-400" />
                <p className="text-sm font-medium text-slate-200">
                  Drag & drop file here, or <span className="text-indigo-400 font-semibold">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, PDF up to 5MB</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleChange}
                />
              </label>
            )}
          </div>
        ) : (
          <div className="relative border border-slate-800 rounded-xl p-3 bg-slate-950/50 flex items-center gap-3">
            <div className="h-12 w-16 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shrink-0">
              <img 
                src={uploadedUrl} 
                alt="Document Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">
                {fileName || "uploaded_document.jpg"}
              </p>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready for submit
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      ) : (
        uploadedUrl && (
          <div className="border border-slate-800/80 rounded-xl overflow-hidden relative group max-h-40">
            <img 
              src={uploadedUrl} 
              alt="Verification File" 
              className="w-full h-40 object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-3">
              <span className="text-xs font-mono text-slate-400 truncate">Document Attachment</span>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DocumentUploadCard;
