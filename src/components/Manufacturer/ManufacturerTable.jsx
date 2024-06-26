import React from "react";
import Table from "react-bootstrap/Table";
import { Link } from "react-bootstrap-icons";
import DeleteButton from "../Generic/DeleteButton";
import { deleteManufacturer } from "../../clients/manufacturer_client";
import ManufacturerModal from "./ManufacturerModal";
import ManufacturerDetailModal from "./ManufacturerDetailModal";

/**
 * Represents a table component to list manufacturers.
 * @param {Object} ManufacturerTable - The props for the ManufacturerTable component.
 * @param {Array} ManufacturerTable.manufacturerList - The list of manufacturers to be displayed in the table.
 * @param {Function} ManufacturerTable.handleEdit - The function to handle the edit action on a manufacturer.
 * @param {Function} ManufacturerTable.clearSearchValue - The function to clear the search value.
 * @returns {JSX.Element} - The ManufacturerTable component.
 */
const ManufacturerTable = ({
  manufacturerList,
  handleEdit,
  clearSearchValue,
}) => {
  return (
    // Table to list manufacturers
    <Table striped bordered hover>
      {/*Table header*/}
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>Name</th>
          <th>Website</th>
          <th>Actions</th>
        </tr>
      </thead>
      {/*Table body*/}
      <tbody>
        {manufacturerList.map((manufacturer, index) => (
          // Table row for each manufacturer
          <tr key={manufacturer.id} className="text-center align-middle">
            {/* Display order number of manufacturer*/}
            <td>{index + 1}</td>
            {/* Display name of manufacturer*/}
            <td>
              {/* Clicking on the name opens the manufacturer detail modal*/}
              <ManufacturerDetailModal
                manufacturerObj={manufacturer}
                updateManufacturers={handleEdit}
                clearSearchValue={clearSearchValue}
              />
            </td>
            {/*Display manufacturer's website*/}
            <td>
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link size={"2rem"} />
              </a>
            </td>
            {/*Display actions: Edit and Delete*/}
            <td className="d-flex flex-row align-items-center justify-content-evenly">
              <div>
                {/* Edit manufacturer information */}
                <ManufacturerModal
                  manufacturerObj={manufacturer}
                  onSuccessfulSubmit={handleEdit}
                  clearSearchValue={clearSearchValue}
                />
              </div>
              {/* Delete manufacturer */}
              <DeleteButton
                objectType="manufacturer"
                objectName={manufacturer.name}
                objectId={manufacturer.id}
                deleteFetchFunc={deleteManufacturer}
                onSuccessfulDelete={handleEdit}
                clearSearchValue={clearSearchValue}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default ManufacturerTable;
