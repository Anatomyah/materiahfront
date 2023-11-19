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

const ShopModal = ({ product, show, setShow }) => {
  const { cart, setCart } = useContext(CartAppContext);
  const [productAmount, setProductAmount] = useState("");

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
        image_url:
          product.images.length > 0 ? product.images[0].image_url : null,
        supplier: product.supplier,
        quantity: Number(productAmount),
      };
      setCart((prevCart) => {
        return [...prevCart, newItem];
      });
    }
    showToast("Product added to cart", "success", "bottom-right");
  };

  const handleClose = () => setShow(false);

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
        <Box sx={modalStyle}>
          <Typography id="product-modal" variant="h3" component="h2">
            {product.name}
          </Typography>
          <Divider sx={{ my: 2, borderColor: "#424242" }} />
          <Container>
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
                  Volume:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">{product.volume}</Typography>
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
          <CarouselComponent images={product.images} />
          <Divider sx={{ my: 2, borderColor: "#424242" }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Box>
              <ButtonGroup
                disableElevation
                variant="contained"
                aria-label="Disabled elevation buttons"
                sx={{ mr: 2 }}
              >
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
              <Button
                variant="outlined"
                onClick={handleAddToCart}
                disabled={productAmount <= 0}
              >
                <AddShoppingCartIcon />
              </Button>
            </Box>
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
