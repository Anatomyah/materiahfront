import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteManufacturer } from "../../clients/manufacturer_client";
import ManufacturerModal from "./ManufacturerModal";

const ManufacturerTable = ({ manufacturerList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>Name</th>
          <th>Website</th>
          <th>Suppliers</th>
          <th>Products</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {manufacturerList.map((manufacturer, index) => (
          <tr key={manufacturer.id} className="text-center align-middle">
            <td>{index + 1}</td>
            <td>
              <a
                href={`/manufacturer-details/${manufacturer.id}`}
                className="link-"
              >
                {manufacturer.name}
              </a>
            </td>
            <td>
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon />
              </a>
            </td>
            <td>
              {manufacturer?.suppliers?.length ? (
                <>
                  {manufacturer.suppliers.map((supplier, index) => (
                    <React.Fragment key={index}>
                      <a href={`/manufacturer-details/${supplier.id}`}>
                        {supplier.name}
                      </a>

                      {index + 1 < manufacturer.suppliers.length && (
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
              {manufacturer?.products?.length ? (
                <>
                  {manufacturer?.products.map((product, index) => (
                    <React.Fragment key={index}>
                      <a href={`/product-details/${product.id}`}>
                        {product.cat_num}
                      </a>
                      {index + 1 < manufacturer.products.length && (
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
                <ManufacturerModal
                  manufacturerObj={manufacturer}
                  onSuccessfulSubmit={handleEdit}
                />
              </div>
              <DeleteButton
                objectType="manufacturer"
                objectName={manufacturer.name}
                objectId={manufacturer.id}
                deleteFetchFunc={deleteManufacturer}
                returnLocation="manufacturers"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default ManufacturerTable;
