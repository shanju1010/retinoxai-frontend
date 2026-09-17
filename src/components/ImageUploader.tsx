import { useRef, useState } from 'react';
import { Upload, ImageIcon, FileImage, X, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
  selectedFile: File | null;
  imagePreview: string | null;
  loading: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onAnalyze: () => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploader({
  selectedFile,
  imagePreview,
  loading,
  error,
  onFileSelect,
  onFileRemove,
  onAnalyze,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function validateAndSelect(file: File) {
    setLocalError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Unsupported file type. Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setLocalError('File is too large. Please upload an image under 10 MB.');
      return;
    }
    onFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }

  function handleBrowse() {
    inputRef.current?.click();
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">Fundus Image</h2>
        </div>
      </div>
      <div className="p-5">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSelect(file);
            e.target.value = '';
          }}
        />

        {!imagePreview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={handleBrowse}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBrowse(); }}
            className={`flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'}`}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
              <Upload className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Upload a clear retinal fundus image</p>
            <p className="text-xs text-slate-400">JPG, JPEG, or PNG — drag and drop or browse</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={imagePreview}
                alt="Uploaded retinal fundus image preview"
                className="w-full h-64 object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{selectedFile?.name}</p>
                  <p className="text-[11px] text-slate-400">{selectedFile && formatSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleBrowse}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600
                    border border-slate-300 rounded-md hover:bg-white hover:text-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </button>
                <button
                  onClick={onFileRemove}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600
                    border border-slate-300 rounded-md hover:bg-rose-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {(localError || error) && (
          <div className="mt-3 px-3 py-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            {localError || error}
          </div>
        )}

        <button
          onClick={onAnalyze}
          disabled={!selectedFile || loading}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white
            bg-teal-700 rounded-md hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing image...
            </>
          ) : (
            'Analyze Image'
          )}
        </button>
      </div>
    </section>
  );
}
