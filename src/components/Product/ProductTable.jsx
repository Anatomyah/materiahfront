import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteProduct } from "../../clients/product_client";
import ProductModal from "./ProductModal";
import { defaultImageUrl } from "../../config_and_helpers/config";
import ProductDetailModal from "./ProductDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";

/**
 * Renders a list of products within a table layout.
 *
 * @component
 * @param {Object} props - The properties that define the ProductTable.
 * @param {Array} props.productList - An array of product objects to be displayed in the table.
 * @param {Function} props.handleEdit - The function to be called when a product is edited or deleted.
 *
 * @example
 * // Here is how to use this component
 * const productList = [
 *    // Here an array of product objects
 * ];
 * const handleEdit = () => {
 *    // Define edit functionality here.
 * };
 * <ProductTable productList={productList} handleEdit={handleEdit} />
 *
 * @returns {React.Element} The rendered ProductTable component.
 */
const ProductTable = ({ productList, handleEdit }) => {
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
          <th>Unit Quantity</th>
          <th>Unit</th>
          <th>Stock</th>
          <th>Storage</th>
          <th>URL</th>
          <th>Manufacturer</th>
          <th>Supplier</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Mapping over the productList to create a table row for each product */}
        {productList.map((product, index) => (
          <tr key={product.id} className="text-center align-middle">
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
            <td>
              {/* Renders the product detail modal for each product */}
              <ProductDetailModal
                productObj={product}
                updateProducts={handleEdit}
              />
            </td>
            <td>{product.cat_num}</td>
            <td>{product.category}</td>
            <td>{product.unit_quantity}</td>
            <td>{product.unit}</td>
            <td>{product.stock}</td>
            <td>{product.storage}</td>
            <td>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <LinkIcon />
              </a>
            </td>
            <td>
              {/* Renders the manufacturer detail modal for each product */}
              {product?.manufacturer && (
                <ManufacturerDetailModal
                  manufacturerId={product.manufacturer}
                />
              )}
            </td>
            <td>
              {/* Renders the supplier detail modal for each product */}
              <SupplierDetailModal supplierId={product.supplier} />
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
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default ProductTable;
