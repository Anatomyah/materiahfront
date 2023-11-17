import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteManufacturer } from "../../clients/manufacturer_client";
import ManufacturerModal from "./ManufacturerModal";
import ProductDetailModal from "../Product/ProductDetailModal";
import SupplierDetailModal from "../Supplier/SupplierDetailModal";
import ManufacturerDetailModal from "./ManufacturerDetailModal";

const ManufacturerTable = ({ manufacturerList, handleEdit }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>Name</th>
          <th>Website</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {manufacturerList.map((manufacturer, index) => (
          <tr key={manufacturer.id} className="text-center align-middle">
            <td>{index + 1}</td>
            <td>
              <ManufacturerDetailModal
                manufacturerObj={manufacturer}
                updateManufacturers={handleEdit}
              />
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
            <td className="d-flex flex-row align-items-center justify-content-evenly">
              <div>
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
                onSuccessfulDelete={handleEdit}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default ManufacturerTable;
