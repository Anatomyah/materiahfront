import React, { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import Modal from "react-bootstrap/Modal";
import { defaultImageUrl } from "../../config_and_helpers/config";

const CarouselComponent = ({
  imageUrls = [defaultImageUrl, defaultImageUrl, defaultImageUrl],
}) => {
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

  return (
    <>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        style={{ width: "45%", height: "40%", margin: "auto" }}
      >
        {imageUrls.map((url, idx) => (
          <Carousel.Item key={idx}>
            <a
              onClick={() => handleImageClick(url)}
              style={{ cursor: "pointer" }}
            >
              <img className="d-block w-100" src={url} alt={`Slide ${idx}`} />
            </a>
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
