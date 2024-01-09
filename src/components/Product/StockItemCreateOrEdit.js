import React, { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import SaveIcon from "@mui/icons-material/Save";
import { createStockItem, updateStockItem } from "../../clients/product_client";
import { showToast } from "../../config_and_helpers/helpers";
import { Spinner } from "react-bootstrap";
import EditIcon from "@mui/icons-material/Edit";
import { AppContext } from "../../App";

const StockItemCreateOrEdit = ({
  productId,
  itemObj,
  index,
  editItem = false,
  onSuccessfulSubmit,
}) => {
  const { token } = useContext(AppContext);
  const [itemData, setItemData] = useState({
    batch: itemObj ? itemObj.batch : "",
    expiry: itemObj ? itemObj.expiry : "",
    inUse: itemObj ? itemObj.in_use : false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEdit, setShowEdit] = useState(editItem);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const showEditItem = () => {
    setShowEdit(!showEdit);
  };

  const handleSubmit = () => {
    const stockItemPromise = itemObj
      ? updateStockItem(token, itemObj.id, itemData)
      : createStockItem(token, productId, itemData);

    stockItemPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          // Callback function on successful submission.
          //   todo - create relevant onSucessfulSubmit
          onSuccessfulSubmit(response.stockItem);
          response.toast(); // Triggers a success toast message.
          setIsSubmitting(false); // Resets the submitting state.
        }, 1000);
      } else {
        // Displays an error toast if the submission fails.
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "success",
          "top-right",
        );
        setIsSubmitting(false); // Resets the submitting state.
      }
    });
  };

  return (
    <>
      <tr className="text-center align-middle">
        {/* Empty cell for the index */}
        <td>{index + 1}</td>
        {/* Stock item data*/}
        <td>{itemObj?.order ? itemObj?.order.order_id : "N/A"}</td>
        <td>{itemObj?.order ? itemObj?.order.order_date : "N/A"}</td>
        <td>
          {showEdit ? (
            itemData.batch
          ) : (
            <Form.Control
              type="text"
              name="batch"
              value={itemData.batch}
              onChange={handleInputChange}
            />
          )}
        </td>
        <td>
          {showEdit ? (
            itemData.expiry
          ) : (
            <Form.Control
              type="date"
              name="expiry"
              value={itemData.expiry}
              onChange={handleInputChange}
            />
          )}
        </td>
        <td>
          {showEdit ? (
            itemData.expiry
          ) : (
            <Form.Check
              type="checkbox"
              name="inUse"
              checked={itemData.inUse}
              onChange={(e) =>
                setItemData({ ...itemData, inUse: e.target.checked })
              }
            />
          )}
        </td>
        <td>
          {!showEdit ? (
            isSubmitting ? (
              <Button variant="outline-success" disabled>
                <Spinner
                  size="sm"
                  as="span"
                  animation="border"
                  role="status"
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => {
                  handleSubmit();
                }}
                className="rounded-edge-button-right"
              >
                <SaveIcon />
              </Button>
            )
          ) : (
            itemObj && (
              <Button
                variant="outline-success"
                size="sm"
                onClick={showEditItem}
              >
                <EditIcon />
              </Button>
            )
          )}
        </td>
      </tr>
    </>
  );
};
export default StockItemCreateOrEdit;
