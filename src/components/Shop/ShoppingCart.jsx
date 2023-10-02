import React, { useContext } from "react";
import { CartAppContext } from "../../App";
import ShopItemComponent from "./ShopItemComponent";

const ShoppingCart = () => {
  const { cart, setCart } = useContext(CartAppContext);

  const updateItem = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    setCart(newCart);
  };

  const removeItem = (e, index) => {
    e.preventDefault();
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  if (cart.length === 0) {
    return <div>Cart is empty</div>;
  }

  return (
    <div>
      {cart.map((item, index) => (
        <ShopItemComponent
          key={`${item.cat_num}-${index}`}
          onItemChange={updateItem}
          index={index}
          item={item}
          handleItemDelete={removeItem}
        />
      ))}
    </div>
  );
};
export default ShoppingCart;
