import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getManufacturerDetails } from "../client/manufacturer_client";
import { AppContext } from "../App";

const ManufacturerDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const [manufacturer, setManufacturer] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    getManufacturerDetails(token, id, setManufacturer).then((response) => {
      if (!response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, [id]);

  if (!manufacturer) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {/* Render manufacturer details */}
      <h1>{manufacturer.name}</h1>
      {/* other fields */}
    </div>
  );
};
export default ManufacturerDetailComponent;
