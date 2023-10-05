import React, { useContext, useEffect, useState } from "react";
import { AppContext, CartAppContext } from "../../App";
import ShopItemComponent from "./ShopItemComponent";
import Button from "@mui/material/Button";
import { createQuoteFromCart } from "../../clients/quote_client";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
  const { token } = useContext(AppContext);
  const { cart, setCart } = useContext(CartAppContext);
  const nav = useNavigate();
  const [groupedCart, setGroupedCart] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    const groupedBySupplier = cart.reduce((acc, item) => {
      const supplierKey = item.supplier.id;
      if (!acc[supplierKey]) {
        acc[supplierKey] = [];
      }
      acc[supplierKey].push(item);
      return acc;
    }, {});
    setGroupedCart(groupedBySupplier);
  }, []);

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
    if (!updatedGroup.length) {
      delete updatedGroup[supplierKey];
    }

    setGroupedCart(updatedGroup);

    const updatedCart = Object.values(updatedGroup).flat();
    setCart(updatedCart);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessages([]);

    createQuoteFromCart(token, groupedCart).then((response) => {
      if (response && response.success) {
        onSuccessfulCreate();
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  if (cart.length === 0) {
    return <div>Cart is empty</div>;
  }

  return (
    <div>
      {groupedCart && (
        <>
          {Object.keys(groupedCart).map((supplierKey) => (
            <div key={supplierKey}>
              <h2>Supplier: {groupedCart[supplierKey][0].supplier.name}</h2>
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
            </div>
          ))}
        </>
      )}
      <Button variant="outlined" onClick={handleSubmit}>
        Request Quote(s)
      </Button>
    </div>
  );
};
export default ShoppingCart;
