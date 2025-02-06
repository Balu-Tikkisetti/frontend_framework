// src/components/EditTopicModal.tsx
import React, { useState, useEffect } from "react";

interface EditTopicModalProps {
  show: boolean;
  onClose: () => void;
  topicText: string;
  topicId: string;
  onSave: (updatedText: string, topicId: string) => void;
}

const EditTopicModal: React.FC<EditTopicModalProps> = ({
  show,
  onClose,
  topicText,
  topicId,
  onSave,
}) => {
  const [updatedText, setUpdatedText] = useState(topicText);

  // Reset text field when topicText changes (i.e., new topic selected)
  useEffect(() => {
    if (show) {
      setUpdatedText(topicText);
    }
  }, [topicText, show]);

  if (!show) return null; // Don't render if modal is not open

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Topic</h5>
          </div>
          <div className="modal-body">
            <textarea
              className="form-control"
              value={updatedText}
              onChange={(e) => setUpdatedText(e.target.value)}
            />
          </div>
          <div className="modal-footer d-flex ">
            <button
              type="button"
              className="btn btn-secondary " // Adds spacing
              data-bs-dismiss="modal"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary w-25"
              onClick={() => onSave(updatedText, topicId)}
            >
              update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTopicModal;
