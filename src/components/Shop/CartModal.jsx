import React, { useContext, useEffect, useState } from "react";
import { AppContext, CartAppContext } from "../../App";
import ShopItemComponent from "./ShopItemComponent";
import Button from "@mui/material/Button";
import { createQuoteFromCart } from "../../clients/quote_client";
import { useNavigate } from "react-router-dom";
import { deepDeleteProperties } from "../../config_and_helpers/helpers";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";

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

const CartModal = ({ show, setShow }) => {
  const { token } = useContext(AppContext);
  const { cart, setCart } = useContext(CartAppContext);
  const nav = useNavigate();
  const [groupedCart, setGroupedCart] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

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

  const onSuccessfulCreate = () => {
    setGroupedCart([]);
    setCart([]);
    nav("/");
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
    setErrorMessages([]);
    const finalCart = deepDeleteProperties(
      JSON.parse(JSON.stringify(groupedCart)),
      ["name", "cat_num", "image", "supplier"],
    );

    createQuoteFromCart(token, finalCart).then((response) => {
      if (response && response.success) {
        onSuccessfulCreate();
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  const handleClose = () => setShow(false);

  return (
    <div>
      <Modal open={show} onClose={handleClose} aria-labelledby="product-modal">
        <Box sx={modalStyle}>
          <Container>
            <Grid
              container
              sx={{ height: "100%" }}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h3" component="h2">
                  Materiah Cart
                </Typography>
              </Grid>
            </Grid>
          </Container>
          <Divider sx={{ my: 2, borderColor: "#424242" }} />
          {Object.keys(groupedCart).length > 0 ? (
            <>
              {Object.keys(groupedCart).map((supplierKey) => {
                const supplierName = groupedCart[supplierKey][0].supplier.name;
                return (
                  <Container key={supplierKey} sx={{ mb: 3 }}>
                    <Divider>
                      <Chip label={supplierName} sx={{ fontSize: "1.5rem" }} />
                    </Divider>
                    {groupedCart[supplierKey].map((item, localIndex) => (
                      <ShopItemComponent
                        key={`${item.cat_num}-${localIndex}`}
                        supplierKey={supplierKey}
                        index={localIndex}
                        item={item}
                        onItemChange={updateGroupedItem}
                        handleItemDelete={removeGroupedItem}
                      />
                    ))}
                  </Container>
                );
              })}
              <Button variant="outlined" onClick={handleSubmit}>
                Request Quote(s)
              </Button>
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
        </Box>
      </Modal>
    </div>
  );
};
export default CartModal;
