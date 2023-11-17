import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, CardActions } from "@mui/material";
import Button from "@mui/material/Button";
import { defaultImageUrl } from "../../config_and_helpers/config";
import ProductDetailModal from "./ProductDetailModal";

const ItemCard = ({ product, handleEdit }) => {
  const [show, setShow] = useState();
  const imageUrl = product?.images[0]?.image_url || defaultImageUrl;

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
          <Button size="small" color="primary">
            Share
          </Button>
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
