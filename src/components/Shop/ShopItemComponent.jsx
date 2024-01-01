import React, { useEffect, useState } from "react";
import { ButtonGroup } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { defaultImageUrl } from "../../config_and_helpers/config";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";

/**
 * Represents a single item component within the shop.
 *
 * This component displays information about a shop item, including its image, name,
 * catalog number, and quantity. It allows users to modify the quantity of the item
 * and provides the functionality to remove the item from the cart.
 *
 * @param {object} props - The component props.
 * @param {number} props.index - The index of the item in the list.
 * @param {boolean} props.dividerStop - Flag to determine if a divider should be shown.
 * @param {object} props.item - The item data.
 * @param {string} props.supplierKey - The key of the supplier for this item.
 * @param {function} props.onItemChange - Callback function when item quantity changes.
 * @param {function} props.handleItemDelete - Callback function to handle item deletion.
 */
const ShopItemComponent = ({
  index,
  dividerStop,
  item,
  supplierKey,
  onItemChange,
  handleItemDelete,
}) => {
  // State for tracking the quantity of the item.
  const [quantity, setQuantity] = useState(item.quantity);

  // Decrements the item quantity, ensuring it doesn't go below 1.
  const handleMinusClick = () => {
    if (quantity <= 1) {
      setQuantity(1);
    } else {
      setQuantity((prevState) => prevState - 1);
    }
  };

  // Increments the item quantity.
  const handlePlusClick = () => {
    setQuantity((prevState) => Number(prevState) + 1);
  };

  // Handles the change in quantity input, preventing non-positive numbers.
  const handleInputChange = (value) => {
    if (value < 1) {
      setQuantity("");
    } else {
      setQuantity(value);
    }
  };

  // Effect hook to update the item's quantity in the parent component.
  useEffect(() => {
    onItemChange(supplierKey, index, "quantity", quantity);
  }, [quantity]);

  return (
    <Container key={item.cat_num} sx={{ padding: 2 }}>
      {/* Container for the shop item */}
      <Grid item xs={12} sm={6}>
        {/* Grid layout for item display */}
        <Grid container alignItems="center">
          <Grid item xs={5}>
            {/* Grid for item image */}
            <img
              src={item?.image_url || defaultImageUrl}
              alt={`product-${item.cat_num}`}
              width="200"
            />
          </Grid>
          <Grid item xs={4}>
            {/* Grid for remove button */}
            <Button
              variant="outlined"
              color="error"
              onClick={(e) => {
                handleItemDelete(e, supplierKey, index);
              }}
            >
              Remove
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={6}>
        {/* Grid for item name */}
        <Typography variant="subtitle1">{item.name}</Typography>
      </Grid>

      <Grid item xs={6}>
        {/* Grid for item catalog number */}
        <Typography variant="subtitle1">{item.cat_num}</Typography>
      </Grid>

      <ButtonGroup
        disableElevation
        variant="contained"
        aria-label="Disabled elevation buttons"
      >
        {/* Button group for quantity adjustment */}
        <Button onClick={handleMinusClick}>-</Button>
        <TextField
          value={quantity}
          onChange={(e) => handleInputChange(e.target.value)}
          id="outlined-number"
          label="Quantity"
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

      {!dividerStop && <Divider sx={{ my: 4, borderColor: "#424242" }} />}
      {/* Conditional rendering of divider based on dividerStop prop */}
    </Container>
  );
};
export default ShopItemComponent;
