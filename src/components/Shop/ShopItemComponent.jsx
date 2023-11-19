import React, { useEffect, useState } from "react";
import { ButtonGroup } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { defaultImageUrl } from "../../config_and_helpers/config";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";

const ShopItemComponent = ({
  index,
  dividerStop,
  item,
  supplierKey,
  onItemChange,
  handleItemDelete,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleMinusClick = () => {
    if (quantity <= 1) {
      setQuantity(1);
    } else {
      setQuantity((prevState) => prevState - 1);
    }
  };

  const handlePlusClick = () => {
    setQuantity((prevState) => Number(prevState) + 1);
  };

  const handleInputChange = (value) => {
    if (value < 1) {
      setQuantity("");
    } else {
      setQuantity(value);
    }
  };

  useEffect(() => {
    onItemChange(supplierKey, index, "quantity", quantity);
  }, [quantity]);

  return (
    <Container key={item.cat_num} sx={{ padding: 2 }}>
      <Grid item xs={12} sm={6}>
        <Grid container alignItems="center">
          <Grid item xs={5}>
            <img
              src={item?.image_url || defaultImageUrl}
              alt={`product-${item.cat_num}`}
              width="200"
            />
          </Grid>
          <Grid item xs={4}>
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
        <Typography variant="subtitle1">{item.name}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1">{item.cat_num}</Typography>
      </Grid>
      <ButtonGroup
        disableElevation
        variant="contained"
        aria-label="Disabled elevation buttons"
      >
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
    </Container>
  );
};
export default ShopItemComponent;
