import React, { useState, useEffect } from 'react';

interface NotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  imagePath: string;
}

const Notes: React.FC<NotesProps> = ({ notes, onNotesChange, imagePath }) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local notes when the image changes
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes, imagePath]);

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = event.target.value;
    setLocalNotes(newNotes);
    onNotesChange(newNotes);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="notes-section">
      <div className="notes-header" onClick={toggleExpanded}>
        <h3>Notes</h3>
        <button 
          type="button" 
          className={`notes-toggle ${isExpanded ? 'expanded' : ''}`}
          aria-label={isExpanded ? 'Collapse notes' : 'Expand notes'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="notes-content">
          <textarea
            value={localNotes}
            onChange={handleNotesChange}
            placeholder="Add notes about this image..."
            className="notes-textarea"
            rows={4}
          />
          <div className="notes-info">
            {localNotes.length > 0 && (
              <span className="character-count">{localNotes.length} characters</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
