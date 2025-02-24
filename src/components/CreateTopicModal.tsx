import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "../css/Modals/CreateTopicModal.css";
import ImageEditorModal from "./ImageEditorModal";

interface CreateTopicModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (topicData: { annotate: string; text: string; photo: File | null }) => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ show, onHide, onSubmit }) => {
  const [annotate, setannotate] = useState<string>("");
  const [topicText, setTopicText] = useState<string>("");
  const [topicPhoto, setTopicPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  // Preview URL for selected image
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  // Control flag to open the image editor modal
  const [showImageEditor, setShowImageEditor] = useState<boolean>(false);

  useEffect(() => {
    if (topicPhoto) {
      const objectUrl = URL.createObjectURL(topicPhoto);
      setImagePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreviewUrl("");
    }
  }, [topicPhoto]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate annotate: required and up to 30 characters
    if (!annotate.trim()) {
      setError("annotate is required.");
      return;
    }
    if (annotate.length > 30) {
      setError("annotate must be at most 30 characters.");
      return;
    }

    // Ensure at least one of topic text or photo is provided
    if (!topicText.trim() && !topicPhoto) {
      setError("Either topic text or an image is required.");
      return;
    }

    setError("");
    onSubmit({ annotate: annotate.trim(), text: topicText.trim(), photo: topicPhoto });
    // Reset form fields
    setannotate("");
    setTopicText("");
    setTopicPhoto(null);
  };

  const handleImageEditorSave = (editedImage: File | null) => {
    setShowImageEditor(false);
    if (editedImage) {
      setTopicPhoto(editedImage);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered className="create-topic-modal">
        <Modal.Header closeButton>
          <Modal.Title>Create New Topic</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>annotate (max 30 characters)</Form.Label>
              <Form.Control
                type="text"
                value={annotate}
                onChange={(e) => setannotate(e.target.value)}
                maxLength={30}
                required
                className="annotate-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Topic Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                className="topic-text-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Photo (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTopicPhoto(e.target.files ? e.target.files[0] : null)
                }
                className="topic-photo-input"
              />
            </Form.Group>
            {imagePreviewUrl && (
              <div className="image-preview mt-3">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="img-fluid rounded"
                  style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
                />
                <Button variant="outline-primary" className="mt-2" onClick={() => setShowImageEditor(true)}>
                  Edit Image
                </Button>
              </div>
            )}
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Create Topic
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {showImageEditor && imagePreviewUrl && (
        <ImageEditorModal
          show={showImageEditor}
          imageSrc={imagePreviewUrl}
          onClose={() => setShowImageEditor(false)}
          onSave={handleImageEditorSave}
        />
      )}
    </>
  );
};

export default CreateTopicModal;
