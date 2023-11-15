import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteProduct } from "../../clients/product_client";
import ProductModal from "./ProductModal";
import { defaultImageUrl } from "../../config_and_helpers/config";

const ProductTable = ({ productList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>Image</th>
          <th>CAT #</th>
          <th>Name</th>
          <th>Category</th>
          <th>Volume</th>
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
        {productList.map((product, index) => (
          <tr key={product.id} className="text-center align-middle">
            <td>{index + 1}</td>
            <td>
              <a
                href={
                  product?.images[0]?.image_url
                    ? product?.images[0]?.image_url
                    : defaultImageUrl
                }
                className="link-"
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
              <a href={`/product-details/${product.id}`} className="link-">
                {product.cat_num}
              </a>
            </td>
            <td>{product.name}</td>
            <td>{product.category}</td>
            <td>{product.volume}</td>
            <td>{product.unit}</td>
            <td>{product.stock}</td>
            <td>{product.storage}</td>
            <td>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <LinkIcon />
              </a>
            </td>
            <td>
              <a
                href={`/manufacturer-details/${product.manufacturer.id}`}
                className="link-"
              >
                {product.manufacturer.name}
              </a>
            </td>
            <td>
              <a
                href={`/supplier-details/${product.supplier.id}`}
                className="link-"
              >
                {product.supplier.name}
              </a>
            </td>
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
                returnLocation="inventory"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default ProductTable;
