import React, { useContext, useEffect, useState } from "react";
import { AppContext, CartAppContext } from "../../App";
import ShopItemComponent from "./ShopItemComponent";
import Button from "@mui/material/Button";
import { createQuoteFromCart } from "../../clients/quote_client";
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

/**
 * Represents the cart modal component in the application.
 *
 * This component is responsible for displaying the contents of the cart grouped by supplier.
 * It allows users to modify the cart items, submit the cart as a quote, and handles UI interactions
 * related to the cart's functionality.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.show - Determines if the modal should be displayed.
 * @param {function} props.setShow - Function to update the visibility state of the modal.
 */
const CartModal = ({ show, setShow }) => {
  // Contexts for global state management, includes token for authentication and cart details.
  const { token } = useContext(AppContext);
  const { cart, setCart } = useContext(CartAppContext);

  // State for grouped items in the cart based on supplier.
  const [groupedCart, setGroupedCart] = useState([]);

  // State to track the submission status of the quote request.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect hook to group cart items by supplier when the cart updates.
  useEffect(() => {
    if (cart) {
      // Groups cart items by their supplier.
      const groupedBySupplier = cart.reduce((acc, item) => {
        const supplierKey = item?.supplier?.id;
        // Initialize an array for each supplier in the accumulator if it doesn't exist.
        if (!acc[supplierKey]) {
          acc[supplierKey] = [];
        }
        // Add the item to its respective supplier's array.
        acc[supplierKey].push(item);
        return acc;
      }, {});
      // Update the state with the grouped items.
      setGroupedCart(groupedBySupplier);
    }
  }, [cart]);

  // Closes the modal and resets the visibility state.
  const handleClose = () => setShow(false);

  // Callback for handling successful quote creation, resets cart states.
  const onSuccessfulCreate = () => {
    setGroupedCart([]);
    setCart([]);
  };

  // Updates a specific item in the grouped cart and synchronizes with the global cart state.
  const updateGroupedItem = (supplierKey, index, field, value) => {
    // Creating a shallow copy of the grouped cart to avoid direct state mutation.
    const updatedGroup = { ...groupedCart };
    // Updating the specified field of the targeted item.
    updatedGroup[supplierKey][index][field] = value;
    // Updating the grouped cart state with the modified group.
    setGroupedCart(updatedGroup);

    // Flattening the grouped cart into a single array for the global cart state.
    const updatedCart = Object.values(updatedGroup).flat();
    // Updating the global cart state with the modified cart.
    setCart(updatedCart);
  };

  // Removes an item from the grouped cart and updates the global cart state.
  const removeGroupedItem = (e, supplierKey, index) => {
    e.preventDefault(); // Prevents default event behavior.
    // Creating a shallow copy of the grouped cart to avoid direct state mutation.
    const updatedGroup = { ...groupedCart };
    // Removing the specified item from the group.
    updatedGroup[supplierKey].splice(index, 1);

    // If no items left for the supplier, delete the supplier key from the group.
    if (updatedGroup[supplierKey].length === 0) {
      delete updatedGroup[supplierKey];
    }

    // Updating the grouped cart state with the modified group.
    setGroupedCart(updatedGroup);

    // Flattening the grouped cart into a single array for the global cart state.
    const updatedCart = Object.values(updatedGroup).flat();
    // Updating the global cart state with the modified cart.
    setCart(updatedCart);
  };

  // Handles the submission of the cart as a quote request.
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents default form submission behavior.
    setIsSubmitting(true); // Sets submission state to true.

    // Prepare cart data and make a request to create a quote.
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
      {/* Modal component that shows the cart items */}
      <Modal open={show} onClose={handleClose} aria-labelledby="product-modal">
        {/* Styling for the modal box */}
        <Box sx={modalStyle}>
          {/* Header section of the modal */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Title for the cart modal */}
            <Typography variant="h3" component="h2">
              Materiah Cart
            </Typography>
            {/* Close button for the modal */}
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Divider for separating the header from content */}
          <Divider sx={{ my: 2, borderColor: "#424242" }} />

          {/* Conditional rendering based on cart items */}
          {Object.keys(groupedCart).length > 0 ? (
            <>
              {/* Mapping through each supplier's items in the cart */}
              {Object.keys(groupedCart).map((supplierKey) => {
                const supplierName = groupedCart[supplierKey][0].supplier.name;
                return (
                  //* Container for each supplier's items
                  <Container key={supplierKey} sx={{ mb: 2 }}>
                    {/* Divider with supplier's name */}
                    <Divider textAlign="left">
                      <Chip
                        label={supplierName}
                        sx={{ fontSize: "1.5rem", mb: 2 }}
                      />
                    </Divider>
                    {/* Mapping through items of a specific supplier */}
                    {groupedCart[supplierKey].map((item, localIndex) => (
                      //* Shop item component for each item
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

              {/* Divider at the end of the list */}
              <Divider sx={{ my: 2, borderColor: "#424242" }} />
            </>
          ) : (
            // Display message when the cart is empty
            <Container>
              <Grid
                container
                sx={{ height: "100%", my: 15 }}
                justifyContent="center"
                alignItems="center"
              >
                {/* Conditional rendering of the submit button */}
                <Grid item>
                  <Typography variant="h4" component="h2">
                    Cart's Empty!
                  </Typography>
                </Grid>
              </Grid>
            </Container>
          )}

          {/* Footer section with action buttons */}
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Conditional rendering of the submit button */}
            <Grid item>
              {isSubmitting ? (
                // Button showing progress while submitting
                <Button variant="contained" disabled>
                  <CircularProgress size={25} />
                </Button>
              ) : (
                // Button to request a quote
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={Object.keys(groupedCart).length === 0}
                >
                  Request Quote(s)
                </Button>
              )}
            </Grid>

            {/* Button to close the modal */}
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
