import React, { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import Modal from "react-bootstrap/Modal";
import { defaultImageUrl } from "../../config_and_helpers/config";
import { defaultPdfUrl } from "../../config_and_helpers/config";

const defaultImages = [
  { image_url: defaultImageUrl },
  { image_url: defaultImageUrl },
  { image_url: defaultImageUrl },
];

const isPdf = (url) => {
  return url.match(/\.(pdf)$/i);
};

const CarouselComponent = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setModalShow(true);
  };

  const imagesToDisplay = images && images.length > 0 ? images : defaultImages;

  return (
    <>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        style={{ width: "70%", height: "70%", margin: "auto" }}
      >
        {imagesToDisplay.map((image, idx) => (
          <Carousel.Item key={idx}>
            {isPdf(image.image_url) ? (
              <a
                href={image.image_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="d-block w-100"
                  src={defaultPdfUrl}
                  alt={`Slide ${idx}`}
                />
              </a>
            ) : (
              <a
                onClick={() => handleImageClick(image.image_url)}
                style={{ cursor: "pointer" }}
              >
                <img
                  className="d-block w-100"
                  src={image.image_url}
                  alt={`Slide ${idx}`}
                />
              </a>
            )}
          </Carousel.Item>
        ))}
      </Carousel>

      <Modal
        size="lg"
        show={modalShow}
        onHide={() => setModalShow(false)}
        centered
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <img
            src={selectedImageUrl}
            alt="Enlarged view"
            className="w-100"
            style={{ cursor: "pointer" }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CarouselComponent;
