import React, { useState, useRef, useEffect } from 'react';

interface ActionsDropdownProps {
  onDownloadResults: () => void;
  onUploadNewZip: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  onDownloadResults,
  onUploadNewZip,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleDownloadClick = () => {
    onDownloadResults();
    setIsOpen(false);
  };

  return (
    <div className="actions-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Actions menu"
      >
        ⋮
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <button
            className="dropdown-item"
            onClick={handleDownloadClick}
            type="button"
          >
            Download Results
          </button>
          <button
            className="dropdown-item"
            onClick={handleUploadClick}
            disabled={isLoading}
            type="button"
          >
            Upload Different Zip
          </button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        id="different-zip-upload"
        type="file"
        accept=".zip"
        onChange={onUploadNewZip}
        disabled={isLoading}
        className="upload-input"
      />
    </div>
  );
};

export default ActionsDropdown;
