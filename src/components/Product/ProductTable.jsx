import React from "react";
import Table from "react-bootstrap/Table";
import { Link } from "react-bootstrap-icons";
import DeleteButton from "../Generic/DeleteButton";
import { deleteProduct } from "../../clients/product_client";
import ProductModal from "./ProductModal";
import {
  CURRENCY_SYMBOLS,
  defaultImageUrl,
} from "../../config_and_helpers/config";
import ProductDetailModal from "./ProductDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";
import {
  calculatePriceAfterDiscount,
  formatDecimalNumber,
  getCurrencySymbol,
} from "../../config_and_helpers/helpers";

/**
 * Displays a table listing of products.
 *
 * @param {Object} ProductTable - The ProductTable component.
 * @param {Array} productList - The list of products to display in the table.
 * @param {Function} handleEdit - A callback function to handle editing a product.
 * @param {Function} clearSearchValue - A callback function to clear the search value.
 * @returns {ReactComponent} - The rendered ProductTable component.
 */
const ProductTable = ({ productList, handleEdit, clearSearchValue }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr className="text-center">
          {/* The table header items */}
          {/* The '#' here stands for the numeric index of the product in the list */}
          <th>#</th>
          <th>Image</th>
          <th>CAT #</th>
          <th>Name</th>
          <th>Category</th>
          <th style={{ minWidth: "130px" }}>Unit Quantity</th>
          <th>Unit</th>
          <th>Stock</th>
          <th>Location</th>
          <th>Price</th>
          <th>URL</th>
          <th>Manufacturer</th>
          <th>Supplier</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Mapping over the productList to create a table row for each product */}
        {productList.map((product, index) => {
          // Calculate total item stock for the current product
          const totalItemStock = product.items.reduce(
            (total, item) => total + item.item_sub_stock,
            0,
          );

          return (
            <tr
              key={product.id}
              className="text-center align-middle"
              style={{ fontSize: "14px" }}
            >
              {/* Displays the serial number of the item */}
              <td>{index + 1}</td>
              {/* Displays the product image, if it exists, or a default image */}
              <td>
                <a
                  href={
                    product?.images[0]?.image_url
                      ? product?.images[0]?.image_url
                      : defaultImageUrl
                  }
                  className="link-"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    style={{ width: "150px", height: "150px" }}
                    src={
                      product?.images[0]?.image_url
                        ? product?.images[0]?.image_url
                        : defaultImageUrl
                    }
                    alt="Product Image"
                  />
                </a>
              </td>
              <td>{product.cat_num}</td>
              <td>
                {/* Renders the product detail modal for each product */}
                <ProductDetailModal
                  productObj={product}
                  updateProducts={handleEdit}
                  clearSearchValue={clearSearchValue}
                />
              </td>
              <td>{product.category}</td>
              <td>{formatDecimalNumber(product.unit_quantity)}</td>
              <td>
                {product.unit === "Assays"
                  ? "Reactions / Tests / Assays"
                  : product.unit}
              </td>
              <td>
                {
                  /* If the product unit is "Assays", replace it with "Reactions / Tests / Assays" */
                  product.unit === "Assays"
                    ? "Reactions / Tests / Assays"
                    : product.unit
                }
              </td>
              <td>
                {
                  /* If product stock is not null, display the stock. If the product unit is "Package" or "Box", display the total item stock */
                  product.stock === null
                    ? null
                    : `${product.stock} ${
                        product.unit === "Package" || product.unit === "Box"
                          ? `(${totalItemStock})`
                          : ""
                      }`
                }
              </td>
              {/* Display product location */}
              <td>{product.location}</td>
              {
                /* If product's discount is null, show only the product price. */
                product.discount === null ? (
                  <td style={{ minWidth: "100px" }}>
                    {product.price !== null
                      ? `${formatDecimalNumber(product.price)}${
                          /* If the product currency has a symbol, append it to the price. */
                          CURRENCY_SYMBOLS[product.currency]
                            ? ` ${getCurrencySymbol(product.currency)}`
                            : ""
                        }`
                      : ""}
                  </td>
                ) : (
                  /* If the product has a discount, show the pre-discount and post-discount prices */
                  <td>
                    <div>
                      <span>
                        Pre-Discount: {formatDecimalNumber(product.price)}
                        {CURRENCY_SYMBOLS[product.currency]
                          ? ` ${getCurrencySymbol(product.currency)}`
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span>
                        Post-Discount:{" "}
                        {/* Calculate the price after the discount is applied */}
                        {calculatePriceAfterDiscount(
                          product.price,
                          product.discount,
                        )}
                        {CURRENCY_SYMBOLS[product.currency]
                          ? ` ${getCurrencySymbol(product.currency)}`
                          : ""}{" "}
                        {/* Display the discount amount in percentage */}
                        (-{formatDecimalNumber(product.discount)}%)
                      </span>
                    </div>
                  </td>
                )
              }
              <td>
                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link size={"2rem"} />
                  </a>
                )}
              </td>
              <td>
                {/* Renders the manufacturer detail modal for each product */}
                {product?.manufacturer && (
                  <ManufacturerDetailModal
                    manufacturerId={product.manufacturer}
                    smallerFont={true}
                  />
                )}
              </td>
              <td>
                {/* Renders the supplier detail modal for each product */}
                <SupplierDetailModal
                  supplierId={product.supplier}
                  smallerFont={true}
                />
              </td>
              {/* Renders an edit button and a delete button for each product */}
              <td className="align-items-center">
                <div className="mb-2">
                  <ProductModal
                    productObj={product}
                    onSuccessfulSubmit={handleEdit}
                  />
                </div>
                <DeleteButton
                  objectType="product"
                  objectName={product.name}
                  objectId={product.id}
                  deleteFetchFunc={deleteProduct}
                  onSuccessfulDelete={handleEdit}
                  clearSearchValue={clearSearchValue}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
export default ProductTable;
