// ImageEditorModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Cropper from 'react-easy-crop';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import '../css/Modals/ImageEditorModal.css';
import getCroppedImg from '../utils/cropImage';

// Define proper types for the cropper
interface Point {
  x: number;
  y: number;
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageEditOptions {
  shadow: boolean;
  brightness: number;
}

interface ImageEditorModalProps {
  show: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (editedImage: File | null) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ show, imageSrc, onClose, onSave }) => {
  // Crop state and zoom
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  // Effects state: shadow toggle and brightness level
  const [shadow, setShadow] = useState(false);
  const [brightness, setBrightness] = useState(100);

  const onCropComplete = useCallback((_: unknown, croppedPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // When user clicks "Save", process the crop and effects, and return a File
  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return;
      
      const croppedBlob = await getCroppedImg(
        imageSrc, 
        croppedAreaPixels, 
        { shadow, brightness } as ImageEditOptions
      );
      const editedFile = new File([croppedBlob], "edited_image.png", { type: 'image/png' });
      onSave(editedFile);
    } catch (err) {
      console.error("Error editing image:", err);
      onSave(null);
    }
  };

  // Wrapper function for handleSave that doesn't return a Promise
  const handleSaveClick = () => {
    void handleSave();
  };

  // Reset local state when modal is reopened
  useEffect(() => {
    if (show) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShadow(false);
      setBrightness(100);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="relative" style={{ height: 400, background: "#333" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="mt-3">
          <label className="form-label">Zoom</label>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(value) => setZoom(value as number)}
          />
        </div>
        <div className="mt-3 d-flex align-items-center">
          <input
            type="checkbox"
            id="shadowEffect"
            checked={shadow}
            onChange={(e) => setShadow(e.target.checked)}
            className="form-check-input me-2"
          />
          <label htmlFor="shadowEffect" className="form-check-label">Apply Shadow</label>
        </div>
        <div className="mt-3">
          <label className="form-label">Brightness</label>
          <Slider
            min={50}
            max={150}
            step={1}
            value={brightness}
            onChange={(value) => setBrightness(value as number)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveClick}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageEditorModal;