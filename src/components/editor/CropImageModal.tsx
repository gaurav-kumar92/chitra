
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const CropImageModal = ({ isOpen, imageNode, onClose, onApply }: { isOpen: boolean, imageNode: any, onClose: () => void, onApply: (dataUrl: string) => void }) => {
  const [imageUrl, setImageUrl] = useState('');
  const cropperRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && imageNode) {
      const imgSrc = imageNode.getAttr('data-original-src') || imageNode.image()?.src;
      if (imgSrc) {
        setImageUrl(imgSrc);
      }
    }
  }, [isOpen, imageNode]);

  const handleApplyCrop = () => {
    const cropper = cropperRef.current?.cropper;
    
    if (!cropper) {
      console.error('Cropper not initialized');
      return;
    }

    const croppedCanvas = cropper.getCroppedCanvas({
      maxWidth: 4096,
      maxHeight: 4096,
      fillColor: '#fff',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!croppedCanvas) {
      console.error('Failed to get cropped canvas');
      return;
    }

    const croppedDataURL = croppedCanvas.toDataURL('image/png');
    
    onApply(croppedDataURL);
    onClose();
  };

  const handleReset = () => {
    cropperRef.current?.cropper?.reset();
  };

  const handleZoomIn = () => {
    cropperRef.current?.cropper?.zoom(0.1);
  };

  const handleZoomOut = () => {
    cropperRef.current?.cropper?.zoom(-0.1);
  };

  const handleRotateLeft = () => {
    cropperRef.current?.cropper?.rotate(-90);
  };

  const handleRotateRight = () => {
    cropperRef.current?.cropper?.rotate(90);
  };

  const handleFlipHorizontal = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const currentScaleX = cropper.getData().scaleX;
      cropper.scaleX(currentScaleX === 1 ? -1 : 1);
    }
  };

  const handleFlipVertical = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const currentScaleY = cropper.getData().scaleY;
      cropper.scaleY(currentScaleY === 1 ? -1 : 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Crop Image</h2>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleApplyCrop}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Apply Crop
              </button>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p>✂️ Drag corners to resize • 🖱️ Drag inside to move • 🔍 Scroll to zoom</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 justify-center bg-gray-50 p-3 rounded">
            <button onClick={handleZoomIn} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-sm" title="Zoom In">🔍+</button>
            <button onClick={handleZoomOut} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-sm" title="Zoom Out">🔍-</button>
            <button onClick={handleRotateLeft} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-sm" title="Rotate Left">↺ 90°</button>
            <button onClick={handleRotateRight} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-sm" title="Rotate Right">↻ 90°</button>
            <button onClick={handleFlipHorizontal} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-sm" title="Flip Horizontal">⇄</button>
            <button onClick={handleFlipVertical} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-sm" title="Flip Vertical">⇅</button>
          </div>

          {imageUrl && (
            <div className="bg-gray-200 rounded-lg p-4 overflow-hidden">
              <Cropper
                ref={cropperRef}
                src={imageUrl}
                style={{ height: 500, width: '100%' }}
                aspectRatio={NaN}
                guides={true}
                viewMode={1}
                dragMode="move"
                cropBoxMovable={true}
                cropBoxResizable={true}
                responsive={true}
                autoCropArea={0.8}
                background={true}
                checkOrientation={false}
                zoomOnWheel={true}
                zoomable={true}
                scalable={true}
                rotatable={true}
              />
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>💡 Tip: Scroll mouse wheel over the image to zoom in/out</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropImageModal;
