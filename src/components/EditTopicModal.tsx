import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { X, Save } from 'lucide-react';

interface Topic {
  id: string;
  annotate: string;
  text: string;
  location: string;
  timestamp: string;
  topicImageUrl: string | null;
  // ... other fields if needed
}

interface EditTopicModalProps {
  show: boolean;
  topic: Topic;
  onClose: () => void;
  onSave: (updatedData: {
    annotate: string;
    text: string;
    location: string;
    newImage?: File | null;
  }) => Promise<void>;
}

const EditTopicModal: React.FC<EditTopicModalProps> = ({ show, topic, onClose, onSave }) => {
  const [updatedAnnotate, setUpdatedAnnotate] = useState<string>(topic.annotate);
  const [updatedText, setUpdatedText] = useState<string>(topic.text);
  const [updatedLocation, setUpdatedLocation] = useState<string>(topic.location);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(topic.topicImageUrl || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // When modal opens, reset state with the topic's current values.
  useEffect(() => {
    if (show) {
      setUpdatedAnnotate(topic.annotate);
      setUpdatedText(topic.text);
      setUpdatedLocation(topic.location);
      setNewImage(null);
      setImagePreviewUrl(topic.topicImageUrl || '');
      setError('');
    }
  }, [topic, show]);

  // Handle image file selection and preview update.
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  // Handle form submission with validation.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate annotate field: required and max 30 characters.
    if (!updatedAnnotate.trim()) {
      setError('Annotate is required.');
      return;
    }
    if (updatedAnnotate.trim().length > 30) {
      setError('Annotate must be at most 30 characters.');
      return;
    }
    // Validate that either text or an image exists.
    if (!updatedText.trim() && !newImage && !imagePreviewUrl) {
      setError('Either topic text or an image is required.');
      return;
    }
    setIsLoading(true);
    try {
      await onSave({
        annotate: updatedAnnotate.trim(),
        text: updatedText.trim(),
        location: updatedLocation.trim(),
        newImage: newImage,
      });
      onClose();
    } catch (err) {
      setError('Failed to update topic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Topic</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Annotate (max 30 characters)</Form.Label>
            <Form.Control
              type="text"
              value={updatedAnnotate}
              onChange={(e) => setUpdatedAnnotate(e.target.value)}
              maxLength={30}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Topic Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={updatedText}
              onChange={(e) => setUpdatedText(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              value={updatedLocation}
              onChange={(e) => setUpdatedLocation(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Update Image (optional)</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Group>

          {imagePreviewUrl && (
            <div className="mb-3 text-center">
              <img
                src={imagePreviewUrl}
                alt="Topic Preview"
                className="img-fluid rounded"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                Updating...
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Save className="w-4 h-4 me-2" />
                Update
              </div>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditTopicModal;
