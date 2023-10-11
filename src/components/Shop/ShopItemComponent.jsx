import React, { useEffect, useState } from "react";
import { ButtonGroup } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const ShopItemComponent = ({
  index,
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

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div key={item.cat_num}>
        {item.image && (
          <img src={item.image} alt={`product-${item.cat_num}`} width="200" />
        )}
        <h1>{item.name}</h1>
        <h1>{item.cat_num}</h1>
        <h1>{item.supplier.name}</h1>
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
        <button
          onClick={(e) => {
            console.log(supplierKey, index);
            handleItemDelete(e, supplierKey, index);
          }}
        >
          Remove Item
        </button>
      </div>
    </div>
  );
};
export default ShopItemComponent;
