import React, { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import Modal from "react-bootstrap/Modal";
import { defaultImageUrl } from "../../config_and_helpers/config";
import { defaultPdfUrl } from "../../config_and_helpers/config";

// Array of the default image urls
const defaultImages = [
  { image_url: defaultImageUrl },
  { image_url: defaultImageUrl },
  { image_url: defaultImageUrl },
];

// Function to identify PDF files
const isPdf = (url) => {
  return url.match(/\.(pdf)$/i);
};

/**
 * A Carousel Component using Bootstrap Carousel.
 *
 * CarouselComponent takes an array of image URLs and displays them in a carousel.
 * Each of the provided images is shown as an item in the Carousel. Clicking an image opens it in a full screen modal.
 * If a pdf link is encountered, it's displayed as a clickable image which upon clicked opens the pdf link in a new tab.
 * If no images are provided, three default images are displayed in the Carousel.
 *
 * @component
 * @prop {Array<Object>} images - An array of image objects where each object should contain an `image_url` property pointing towards the image or pdf location.
 * - `image_url`: string
 *
 * @example
 * const images = [{image_url: "http://example.com/myimg.jpg"}, {image_url: "http://example.com/myimg2.jpg"}];
 *
 * return (
 *   <CarouselComponent images={images}/>
 * )
 */
const CarouselComponent = ({ images }) => {
  // Using state hooks to manage carousel item index, modal visibility, and selected image URL
  const [index, setIndex] = useState(0); // Tracks the current active image index in the carousel
  const [modalShow, setModalShow] = useState(false); // Controls the visibility of the image modal
  const [selectedImageUrl, setSelectedImageUrl] = useState(""); // Stores the currently selected image URL to display in the modal

  // Function to update the currently active carousel item
  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Function to handle image click event, it updates the selectedImageUrl and shows the modal
  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setModalShow(true);
  };

  // If no image or an empty image array is provided, use default images
  const imagesToDisplay = images && images.length > 0 ? images : defaultImages;

  return (
    <>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        style={{ width: "70%", height: "70%", margin: "auto" }} // Style applied to Carousel
      >
        {/* Map through imagesToDisplay array to create Carousel Items */}
        {imagesToDisplay.map((image, idx) => (
          <Carousel.Item key={idx}>
            {/* If the image URL points to a PDF, open the PDF in a new tab when clicked.
                Otherwise, show the image onClick in a modal. */}
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

      {/* Modal to show the selected image in an enlarged view */}
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
