import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteSupplier } from "../../clients/supplier_client";
import SupplierModal from "./SupplierModal";
import SupplierDetailModal from "./SupplierDetailModal";

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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {supplierList.map((supplier, index) => (
          <tr key={supplier.id} className="text-center align-middle">
            <td>{index + 1}</td>
            <td>
              <SupplierDetailModal
                supplierObj={supplier}
                updateSuppliers={handleEdit}
              />
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
            <td className="d-flex flex-row align-items-center justify-content-evenly">
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
                onSuccessfulDelete={handleEdit}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default SupplierTable;
