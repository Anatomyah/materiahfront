import React, { useContext, useState } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LinkIcon from "@mui/icons-material/Link";
import Divider from "@mui/material/Divider";
import CarouselComponent from "../Generic/CarouselComponent";
import { CartAppContext } from "../../App";
import { ButtonGroup } from "@mui/material";
import TextField from "@mui/material/TextField";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { showToast } from "../../config_and_helpers/helpers";

/**
 * Represents the modal component for a shop product.
 *
 * This component displays detailed information about a product, including its
 * catalogue number, stock, category, supplier, unit, unit_quantity, and storage details.
 * It provides functionality to add the product to the cart with a specified quantity,
 * and showcases product images through a carousel.
 *
 * @param {object} props - The component props.
 * @param {object} props.product - The product data to be displayed.
 * @param {boolean} props.show - Flag to control the visibility of the modal.
 * @param {function} props.setShow - Function to update the visibility state of the modal.
 */
const ShopModal = ({ product, show = false, setShow }) => {
  // Context for global cart state and function to update it.
  const { cart, setCart } = useContext(CartAppContext);

  // State for tracking the selected product amount.
  const [productAmount, setProductAmount] = useState("");

  // Decreases the product amount, ensuring it doesn't go below 1.
  const handleMinusClick = () => {
    if (productAmount <= 1) {
      setProductAmount("");
    } else {
      setProductAmount((prevState) => prevState - 1);
    }
  };

  // Increases the product amount.
  const handlePlusClick = () => {
    if (productAmount === 0) {
      setProductAmount(1);
    } else {
      setProductAmount((prevState) => Number(prevState) + 1);
    }
  };

  // Handles input change for the product amount.
  const handleInputChange = (value) => {
    if (value < 1) {
      setProductAmount("");
    } else {
      setProductAmount(value);
    }
  };

  // Adds the product to the cart and updates the global cart state.
  const handleAddToCart = () => {
    // Checks if the product already exists in the cart.
    const itemExists = cart.some((item) => item.cat_num === product.cat_num);

    if (itemExists) {
      // If the product exists, increment its quantity in the cart.
      setCart((prevCart) => {
        return prevCart.map((item) =>
          item.cat_num === product.cat_num
            ? {
                ...item,
                // Update the quantity by adding the selected amount.
                quantity: Number(item.quantity) + Number(productAmount),
              }
            : item,
        );
      });
    } else {
      // If the product does not exist, create a new item entry.
      const newItem = {
        // Product details to be added.
        product: product.id,
        cat_num: product.cat_num,
        name: product.name,
        image_url:
          // Use the first image URL or null if no images are available.
          product.images.length > 0 ? product.images[0].image_url : null,
        supplier: product.supplier,
        quantity: Number(productAmount),
      };
      // Add the new item to the cart.
      setCart((prevCart) => {
        return [...prevCart, newItem];
      });
    }
    // Show a toast message indicating successful addition.
    showToast("Product added to cart", "success", "bottom-right");
  };

  // Closes the modal and resets the visibility state.
  const handleClose = () => setShow(false);

  // Styling for the modal component.
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal open={show} onClose={handleClose} aria-labelledby="product-modal">
        {/* Styling for the modal box */}
        <Box sx={modalStyle}>
          {/* Product name as the modal title */}
          <Typography id="product-modal" variant="h3" component="h2">
            {product.name}
          </Typography>

          {/* Dividers for visual separation */}
          <Divider sx={{ my: 2, borderColor: "#424242" }} />

          {/* Product details displayed in a grid layout */}
          <Container>
            {/* Various product attributes like catalogue number, stock, etc. */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Catalogue Number:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{product.cat_num}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Stock:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{product.stock}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Category:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{product.category}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Supplier:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">
                  {product.supplier.name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Unit:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{product.unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Unit Quantity:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">
                  {product.unit_quantity}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Storage:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{product.storage}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" className="fw-bold">
                  Website Profile:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <a href={product.url}>
                  <LinkIcon sx={{ fontSize: "36px" }} />
                </a>
              </Grid>
            </Grid>
          </Container>

          <Divider sx={{ my: 2, borderColor: "#424242" }} />

          {/* Carousel component to display product images */}
          <CarouselComponent images={product.images} />

          <Divider sx={{ my: 2, borderColor: "#424242" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            {/* Action area for adding product to cart */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              {/* Button group for product amount selection */}
              <ButtonGroup
                disableElevation
                variant="contained"
                aria-label="Disabled elevation buttons"
                sx={{ mr: 2 }}
              >
                {/* Buttons for incrementing/decrementing product amount */}
                <Button onClick={handleMinusClick}>-</Button>
                <TextField
                  value={productAmount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  id="outlined-number"
                  label="Amount"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onKeyPress={(e) => {
                    if (e.key.match(/[^0-9]/)) {
                      e.preventDefault();
                    }
                  }}
                />
                <Button onClick={handlePlusClick}>+</Button>
              </ButtonGroup>

              {/* Button to add the product to the cart */}
              <Button
                variant="outlined"
                onClick={handleAddToCart}
                disabled={productAmount <= 0}
              >
                <AddShoppingCartIcon />
              </Button>
            </Box>

            {/* Button to close the modal */}
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ShopModal;
