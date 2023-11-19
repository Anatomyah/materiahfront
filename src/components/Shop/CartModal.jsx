import React, { useContext, useEffect, useState } from "react";
import { AppContext, CartAppContext } from "../../App";
import ShopItemComponent from "./ShopItemComponent";
import Button from "@mui/material/Button";
import { createQuoteFromCart } from "../../clients/quote_client";
import { useNavigate } from "react-router-dom";
import {
  deepDeleteProperties,
  showToast,
} from "../../config_and_helpers/helpers";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  maxWidth: "900px",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const CartModal = ({ show, setShow }) => {
  const { token } = useContext(AppContext);
  const { cart, setCart } = useContext(CartAppContext);
  const nav = useNavigate();
  const [groupedCart, setGroupedCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cart) {
      const groupedBySupplier = cart.reduce((acc, item) => {
        const supplierKey = item?.supplier?.id;
        if (!acc[supplierKey]) {
          acc[supplierKey] = [];
        }
        acc[supplierKey].push(item);
        return acc;
      }, {});
      setGroupedCart(groupedBySupplier);
    }
  }, [cart]);

  const handleClose = () => setShow(false);

  const onSuccessfulCreate = () => {
    setGroupedCart([]);
    setCart([]);
  };

  const updateGroupedItem = (supplierKey, index, field, value) => {
    const updatedGroup = { ...groupedCart };
    updatedGroup[supplierKey][index][field] = value;
    setGroupedCart(updatedGroup);

    const updatedCart = Object.values(updatedGroup).flat();
    setCart(updatedCart);
  };

  const removeGroupedItem = (e, supplierKey, index) => {
    e.preventDefault();
    const updatedGroup = { ...groupedCart };
    updatedGroup[supplierKey].splice(index, 1);

    if (updatedGroup[supplierKey].length === 0) {
      delete updatedGroup[supplierKey];
    }

    setGroupedCart(updatedGroup);

    const updatedCart = Object.values(updatedGroup).flat();
    setCart(updatedCart);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalCart = deepDeleteProperties(
      JSON.parse(JSON.stringify(groupedCart)),
      ["name", "cat_num", "image_url", "supplier"],
    );

    createQuoteFromCart(token, finalCart).then((response) => {
      if (response && response.success) {
        onSuccessfulCreate();
        response.toast();
        handleClose();
      } else {
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
        );
      }
      setIsSubmitting(false);
    });
  };

  return (
    <div>
      <Modal open={show} onClose={handleClose} aria-labelledby="product-modal">
        <Box sx={modalStyle}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h3" component="h2">
              Materiah Cart
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2, borderColor: "#424242" }} />
          {Object.keys(groupedCart).length > 0 ? (
            <>
              {Object.keys(groupedCart).map((supplierKey) => {
                const supplierName = groupedCart[supplierKey][0].supplier.name;
                return (
                  <Container key={supplierKey} sx={{ mb: 2 }}>
                    <Divider textAlign="left">
                      <Chip
                        label={supplierName}
                        sx={{ fontSize: "1.5rem", mb: 2 }}
                      />
                    </Divider>
                    {groupedCart[supplierKey].map((item, localIndex) => (
                      <ShopItemComponent
                        key={`${item.cat_num}-${localIndex}`}
                        supplierKey={supplierKey}
                        index={localIndex}
                        dividerStop={
                          groupedCart[supplierKey].length === localIndex + 1
                        }
                        grouplength={groupedCart[supplierKey].length}
                        item={item}
                        onItemChange={updateGroupedItem}
                        handleItemDelete={removeGroupedItem}
                      />
                    ))}
                  </Container>
                );
              })}
              <Divider sx={{ my: 2, borderColor: "#424242" }} />
            </>
          ) : (
            <Container>
              <Grid
                container
                sx={{ height: "100%", my: 15 }}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h4" component="h2">
                    Cart's Empty!
                  </Typography>
                </Grid>
              </Grid>
            </Container>
          )}
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              {isSubmitting ? (
                <Button variant="contained" disabled>
                  <CircularProgress size={25} />
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={Object.keys(groupedCart).length === 0}
                >
                  Request Quote(s)
                </Button>
              )}
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                style={{ backgroundColor: "lightslategray", color: "white" }}
                onClick={handleClose}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
};
export default CartModal;
