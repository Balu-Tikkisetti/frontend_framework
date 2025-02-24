import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ImageModalProps {
  show: boolean;
  onHide: () => void;
  imageUrl: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ show, onHide, imageUrl }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">

      <Modal.Body className="text-center">
        <img
          src={imageUrl}
          alt="Full Preview"
          className="img-fluid"
          style={{ maxHeight: "80vh", width: "auto" }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;
