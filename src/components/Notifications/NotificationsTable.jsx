import React from "react";
import Table from "react-bootstrap/Table";
import ManufacturerDetailModal from "../Manufacturer/ManufacturerDetailModal";
import LinkIcon from "@mui/icons-material/Link";
import ManufacturerModal from "../Manufacturer/ManufacturerModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteManufacturer } from "../../clients/manufacturer_client";

const NotificationsTable = (notificationsList, handleEdit) => {
  return (
    // Table to list manufacturers
    <Table striped bordered hover>
      {/*Table header*/}
      <thead>
        <tr className="text-center">
          <th>#</th>
          <th>ID</th>
          <th>Website</th>
          <th>Actions</th>
        </tr>
      </thead>
      {/*Table body*/}
      <tbody>
        {notificationsList.map((manufacturer, index) => (
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
export default NotificationsTable;
