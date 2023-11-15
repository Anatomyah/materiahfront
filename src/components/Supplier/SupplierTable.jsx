import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteSupplier } from "../../clients/supplier_client";
import SupplierModal from "./SupplierModal";

const SupplierTable = ({ supplierList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>Name</th>
          <th>Website</th>
          <th>Office Email</th>
          <th>Office Phone</th>
          <th>Manufacturers</th>
          <th>Products</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {supplierList.map((supplier, index) => (
          <tr key={supplier.id} className="text-center align-middle">
            <td>{index + 1}</td>
            <td>
              <a href={`/supplier-details/${supplier.id}`} className="link-">
                {supplier.name}
              </a>
            </td>
            <td>
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon />
              </a>
            </td>
            <td>{supplier.email}</td>
            <td>
              {supplier.phone_prefix}-{supplier.phone_suffix}
            </td>
            <td>
              {supplier?.manufacturers?.length ? (
                <>
                  {supplier.manufacturers.map((manufacturer, index) => (
                    <React.Fragment key={index}>
                      <a href={`/manufacturer-details/${manufacturer.id}`}>
                        {manufacturer.name}
                      </a>

                      {index + 1 < supplier.manufacturers.length && (
                        <span> | </span>
                      )}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <span></span>
              )}
            </td>
            <td>
              {supplier?.products?.length ? (
                <>
                  {supplier.products.map((product, index) => (
                    <React.Fragment key={index}>
                      <a href={`/product-details/${product.id}`}>
                        {product.cat_num}
                      </a>
                      {supplier.products.length !== index + 1 && (
                        <span> | </span>
                      )}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <span></span>
              )}
            </td>
            <td className="align-items-center">
              <div className="mb-2">
                <SupplierModal
                  supplierObj={supplier}
                  onSuccessfulSubmit={handleEdit}
                />
              </div>
              <DeleteButton
                objectType="supplier"
                objectName={supplier.name}
                objectId={supplier.id}
                deleteFetchFunc={deleteSupplier}
                returnLocation="suppliers"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default SupplierTable;
