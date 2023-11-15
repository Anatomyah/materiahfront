import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext, CartAppContext } from "../../App";
import { deleteProduct, getProductDetails } from "../../clients/product_client";
import DeleteButton from "../Generic/DeleteButton";
import ProductModal from "./ProductModal";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import CarouselComponent from "../Generic/CarouselComponent";

const ProductDetailModal = ({ productId, shopView = false }) => {
  const { token } = useContext(AppContext);
  const { cart, setCart } = useContext(CartAppContext);
  const [productAmount, setProductAmount] = useState("");
  const [product, setProduct] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (!product) {
      fetchProduct();
    }
  }, [productId, product]);

  const fetchProduct = () => {
    getProductDetails(token, productId, setProduct).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  const handleMinusClick = () => {
    if (productAmount <= 1) {
      setProductAmount("");
    } else {
      setProductAmount((prevState) => prevState - 1);
    }
  };

  const handlePlusClick = () => {
    if (productAmount === 0) {
      setProductAmount(1);
    } else {
      setProductAmount((prevState) => Number(prevState) + 1);
    }
  };

  const handleInputChange = (value) => {
    if (value < 1) {
      setProductAmount("");
    } else {
      setProductAmount(value);
    }
  };

  const handleAddToCart = () => {
    const itemExists = cart.some((item) => item.cat_num === product.cat_num);

    if (itemExists) {
      setCart((prevCart) => {
        return prevCart.map((item) =>
          item.cat_num === product.cat_num
            ? {
                ...item,
                quantity: Number(item.quantity) + Number(productAmount),
              }
            : item,
        );
      });
    } else {
      const newItem = {
        product: product.id,
        cat_num: product.cat_num,
        name: product.name,
        image: product.images.length > 0 ? product.images[0].image : null,
        supplier: product.supplier,
        quantity: Number(productAmount),
      };
      setCart((prevCart) => {
        return [...prevCart, newItem];
      });
    }
  };

  if (!product) {
    return "Product details not available";
  }

  return (
    <>
      <Button onClick={handleShow}>Large modal</Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Large Modal
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CarouselComponent />
          <hr />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductDetailModal;
