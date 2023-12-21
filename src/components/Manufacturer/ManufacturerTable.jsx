import React from "react";
import Table from "react-bootstrap/Table";
import LinkIcon from "@mui/icons-material/Link";
import DeleteButton from "../Generic/DeleteButton";
import { deleteManufacturer } from "../../clients/manufacturer_client";
import ManufacturerModal from "./ManufacturerModal";
import ManufacturerDetailModal from "./ManufacturerDetailModal";

/**
 * ManufacturerTable Component.
 *
 * This is a table component that displays a list of manufacturers.
 * Each row in the table represents a manufacturer and displays their name, website, and actions (edit and delete).
 * Each manufacturer name in the table is a button that opens a modal containing more details about the manufacturer.
 *
 * @component
 *
 * @prop {Array<{id: string, name: string, website: string}>} manufacturerList - Array of objects, where each object represents a manufacturer and their details (id, name, and website).
 * @prop {Function} handleEdit - Function to handle edit requests.
 *
 * @example
 *
 * const manufacturerList = [
 *   { id: '1', name: 'Manufacturer 1', website: 'www.manufacturer1.com'},
 *   { id: '2', name: 'Manufacturer 2', website: 'www.manufacturer2.com'},
 * ];
 * let handleEdit = (updatedManufacturer) => {
 *   // Save the updated manufacturer to backend here
 * };
 *
 * return (
 *   <ManufacturerTable
 *     manufacturerList={manufacturerList}
 *     handleEdit={handleEdit}
 *   />
 * );
 *
 */
const ManufacturerTable = ({ manufacturerList, handleEdit }) => {
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
              />
            </td>
            {/*Display manufacturer's website*/}
            <td>
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon />
              </a>
            </td>
            {/*Display actions: Edit and Delete*/}
            <td className="d-flex flex-row align-items-center justify-content-evenly">
              <div>
                {/* Edit manufacturer information */}
                <ManufacturerModal
                  manufacturerObj={manufacturer}
                  onSuccessfulSubmit={handleEdit}
                />
              </div>
              {/* Delete manufacturer */}
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
