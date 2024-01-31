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
import SupplierDetailModal from "../Supplier/SupplierDetailModal";

/**
 * Represents an item card component, displaying key details of a product and providing quick actions.
 *
 * This component shows a product's information like its name, catalogue number, supplier, manufacturer, category,
 * and unit quantity. It allows users to view more details about the product and to add the product to a shopping cart.
 * The card uses Material UI components for a consistent and responsive design.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.product - The product object containing information to display on the card.
 * @param {Function} props.handleEdit - Callback function to handle updates to the product.
 * @returns The ItemCard component.
 *
 * Usage:
 * ```jsx
 * <ItemCard
 *    product={productDetails}
 *    handleEdit={editHandler}
 * />
 * ```
 */
const ItemCard = ({ product, handleEdit }) => {
  // Context for managing cart items.
  const { cart, setCart } = useContext(CartAppContext);

  console.log(product);
  // State for controlling the visibility of the product detail modal.
  const [show, setShow] = useState(false);

  // URL for the product's image, falling back to a default if none is available.
  const imageUrl = product?.images[0]?.image_url || defaultImageUrl;

  // Function to handle adding the product to the cart.
  const handleQuickAddToCart = () => {
    // Check if the product is already in the cart.
    const itemExists = cart.some((item) => item.cat_num === product.cat_num);

    // Update the cart based on whether the product is already present.
    if (itemExists) {
      // If the product is in the cart, increase its quantity.
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.cat_num === product.cat_num
            ? { ...item, quantity: Number(item.quantity) + Number(1) }
            : item,
        ),
      );
    } else {
      // If the product is not in the cart, add it as a new item.
      const newItem = {
        product: product.id,
        cat_num: product.cat_num,
        name: product.name,
        image_url:
          product.images.length > 0 ? product.images[0].image_url : null,
        supplier: product.supplier,
        quantity: Number(1),
      };
      setCart((prevCart) => [...prevCart, newItem]);
    }
    // Show a toast notification for adding to the cart.
    showToast("Product added to cart", "success", "bottom-right", 1500);
  };

  return (
    <>
      {/* Material UI Card component containing product details. */}
      <Card sx={{ maxWidth: 400, maxHeight: 500 }}>
        {/* Area for user interaction, opens the detail modal on click. */}
        <CardActionArea onClick={() => setShow(true)}>
          {/* Product image. */}
          <CardMedia component="img" height="250" image={imageUrl} />
          {/* Content section with product details. */}
          <CardContent>
            {/* Display product name, catalogue number, and other attributes. */}
            <Typography gutterBottom variant="h4" component="div">
              {product.name}
            </Typography>
            <Typography gutterBottom variant="subtitle1" component="div">
              {product.catNum}
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <div
                style={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Supplier:</span>
                <SupplierDetailModal supplierId={product.supplier.id} />
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Category:</span>{" "}
                {product.category}
              </div>
              <div style={{ marginTop: "6px" }}>
                <span style={{ fontWeight: "bold" }}>Unit Quantity:</span>{" "}
                {product.unit_quantity} ({product.unit})
              </div>
            </Typography>
          </CardContent>
        </CardActionArea>
        {/* Action area for the card, with a button to add the product to the cart. */}
        <CardActions>
          <IconButton
            aria-label="add to cart"
            sx={{ color: "primary.main" }}
            onClick={handleQuickAddToCart}
          >
            <AddShoppingCartIcon />
          </IconButton>
        </CardActions>
      </Card>

      {/* Modal for displaying detailed product information. */}
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
