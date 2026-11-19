import { useState, useRef, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import "./FileUpload.css";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUpload({
  label,
  accept = ".png,.jpg,.jpeg,.pdf",
  maxSizeMB = 10,
  multiple = true,
  files = [],
  onFilesChange,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter(
      (f) => f.size <= maxSizeMB * 1024 * 1024
    );
    onFilesChange?.([...files, ...validFiles]);
  }, [files, maxSizeMB, onFilesChange]);

  const removeFile = useCallback((index) => {
    onFilesChange?.(files.filter((_, i) => i !== index));
  }, [files, onFilesChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div className={`ht-file-upload ${className}`}>
      {label && <span className="ht-file-upload__label">{label}</span>}
      <div
        className={`ht-file-upload__dropzone ${isDragging ? "ht-file-upload__dropzone--active" : ""}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        <Upload className="ht-file-upload__icon" size={24} />
        <div className="ht-file-upload__text">
          <a>Faça upload de um arquivo</a> ou arraste e solte
        </div>
        <div className="ht-file-upload__hint">
          {accept.replace(/\./g, "").toUpperCase()} até {maxSizeMB}MB
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        style={{ display: "none" }}
      />
      {files.length > 0 && (
        <div className="ht-file-upload__files">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="ht-file-upload__file">
              <File size={14} />
              <span className="ht-file-upload__file-name">{file.name}</span>
              <span className="ht-file-upload__file-size">{formatSize(file.size)}</span>
              <button
                type="button"
                className="ht-file-upload__file-remove"
                onClick={() => removeFile(i)}
                aria-label={`Remover ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
