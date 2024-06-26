import React from "react";
import Table from "react-bootstrap/Table";
import DeleteButton from "../Generic/DeleteButton";
import { Link } from "react-bootstrap-icons";
import { deleteSupplier } from "../../clients/supplier_client";
import SupplierModal from "./SupplierModal";
import SupplierDetailModal from "./SupplierDetailModal";

/**
 * SupplierTable is a functional component that renders a table of suppliers.
 *
 * @param {Object} supplierList - The list of suppliers to display in the table.
 * @param {Function} handleEdit - The function to handle edits made to a supplier.
 * @param {Function} clearSearchValue - The function to clear the search value.
 * @returns {JSX.Element} - Returns the rendered table component.
 */
const SupplierTable = ({ supplierList, handleEdit, clearSearchValue }) => {
  return (
    <Table striped bordered hover>
      {/* Start of the Table component */}
      <thead>
        <tr className="text-center">
          {/* Table header row */}
          <th>#</th> {/* Index column */}
          <th>Name</th> {/* Name column */}
          <th>Website</th> {/* Website column */}
          <th>Main Email</th> {/* Office Email column */}
          <th>Office Phone</th> {/* Office Phone column */}
          <th>Actions</th> {/* Actions column */}
        </tr>
      </thead>
      <tbody>
        {supplierList.map((supplier, index) => (
          <tr key={supplier.id} className="text-center align-middle">
            {/* table row for each supplier */}
            <td>{index + 1}</td> {/* Display suppliers index */}
            <td>
              <SupplierDetailModal
                supplierObj={supplier} // Pass the current supplier to the Detail Modal component
                updateSuppliers={handleEdit} // Pass the handleEdit function to the Detail Modal component
                clearSearchValue={clearSearchValue}
              />
            </td>
            <td>
              <a
                href={supplier.website} //* Link to supplier's website
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link size={"2rem"} /> {/* Link icon */}
              </a>
            </td>
            <td>{supplier.email}</td> {/* Display supplier's office email */}
            <td>
              {supplier?.phone_prefix && supplier?.phone_suffix && (
                <span>
                  {supplier.phone_prefix}-{supplier.phone_suffix}
                </span>
              )}
              {/* Display supplier's office phone number */}
            </td>
            <td className="d-flex flex-row align-items-center justify-content-evenly">
              <SupplierModal
                supplierObj={supplier} // Pass the current supplier to the Modal component
                onSuccessfulSubmit={handleEdit} //* Pass the handleEdit function to the Modal component
                clearSearchValue={clearSearchValue}
              />
              <DeleteButton
                objectType="supplier" // Object type is supplier
                objectName={supplier.name} // Pass supplier name
                objectId={supplier.id} // Pass supplier ID
                deleteFetchFunc={deleteSupplier} //Pass deleteSupplier function
                onSuccessfulDelete={handleEdit} // Once deletion is successful, refresh supplier list using handleEdit function
                clearSearchValue={clearSearchValue}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default SupplierTable;
