import React, { useContext, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, CardActions, IconButton } from "@mui/material";
import { defaultImageUrl } from "../../config_and_helpers/config";
import ProductDetailModal from "./ProductDetailModal";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { showToast } from "../../config_and_helpers/helpers";
import { CartAppContext } from "../../App";

const ItemCard = ({ product, handleEdit }) => {
  const { cart, setCart } = useContext(CartAppContext);
  const [show, setShow] = useState();
  const imageUrl = product?.images[0]?.image_url || defaultImageUrl;

  const handleQuickAddToCart = () => {
    const itemExists = cart.some((item) => item.cat_num === product.cat_num);

    if (itemExists) {
      setCart((prevCart) => {
        return prevCart.map((item) =>
          item.cat_num === product.cat_num
            ? {
                ...item,
                quantity: Number(item.quantity) + Number(1),
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
        quantity: Number(1),
      };
      setCart((prevCart) => {
        return [...prevCart, newItem];
      });
    }
    showToast("Product added to cart", "success", "bottom-right");
  };

  return (
    <>
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea onClick={() => setShow(true)}>
          <CardMedia component="img" height="200" image={imageUrl} />
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              {product.name}
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              {product.catNum}
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <div>
                <span style={{ fontWeight: "bold" }}>Supplier:</span>
                {product.supplier.name}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Manufacturer:</span>
                {product.manufacturer.name}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Category:</span>
                {product.category}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Volume:</span>{" "}
                {product.volume}
              </div>
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <IconButton
            aria-label="add"
            sx={{ color: "primary.main" }}
            onClick={handleQuickAddToCart}
          >
            <AddShoppingCartIcon />
          </IconButton>
        </CardActions>
      </Card>
      <ProductDetailModal
        productObj={product}
        shopView={true}
        showShopModal={show}
        setShowShopModal={setShow}
        updateProducts={handleEdit}
      />
    </>
  );
};
export default ItemCard;
