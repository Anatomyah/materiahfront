import React, { useContext, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";
import { AppContext } from "../../App";
import {
  createStockItem,
  deleteStockItem,
  updateStockItem,
} from "../../clients/product_client";
import {
  getCurrentDate,
  isExpiryInSixMonths,
  showToast,
} from "../../config_and_helpers/helpers";
import OrderDetailModal from "../Order/OrderDetailModal";
import "./ProductComponentStyle.css";

// checkmarkIcon: The icon for item save
const checkmarkIcon = (
  <i className="fa fa-check-circle" style={{ color: "green" }}></i>
);

// cancelIcon: The icon for cancel item editing
const invalidIcon = (
  <i className="fa fa-solid fa-ban" style={{ color: "red" }}></i>
);

// trashIcon: The icon for indicating deletion
const trashIcon = (
  <i className="fa fa-solid fa-trash" style={{ color: "red" }}></i>
);

// editIcon: The icon for indicating editing
const editIcon = (
  <i className="fa fa-regular fa-pencil" style={{ color: "green" }}></i>
);

/**
 * This component is used to manipulate the stock of a product in the system.
 * The component provides functionalities to create, update and delete stock items.
 * Moreover, it allows you to enable/disable a stock item from being used in the system.
 *
 * @component
 * @param {Object} props - The properties passed down to this component.
 * @param {string} props.productId - The id of the associated product.
 * @param {Object} props.itemObj - The initial stock item data, an object with `batch`, `expiry` and `in_use` properties.
 * @param {number} props.index - The index position of the stock item in the list.
 * @param {boolean} [props.editItem=false] - If the item is being edited. Default value is `false`.
 * @param {function} [props.showAddNewItem] - A function to be called when a new item needs to be added to the stock list.
 * @param {function} [props.onSuccessfulSubmit] - A function to be called when a stock item is successfully updated, created or deleted.
 *
 * @returns {React.Element} The rendered StockItemComponent.
 *
 * @example
 * <StockItemComponent productId={productId} itemObj={itemObj} index={index}/>
 */
const StockItemComponent = ({
  productId,
  itemObj,
  index,
  editItem = false,
  showAddNewItem,
  onSuccessfulSubmit,
}) => {
  // Use the context hook to access the token.
  const { token } = useContext(AppContext);

  // Use the state hook to manage item data.
  // Initialize with the provided itemObject or an empty object if not provided.
  const [itemData, setItemData] = useState({
    batch: itemObj ? itemObj.batch : "",
    expiry: itemObj ? itemObj.expiry : "",
    inUse: itemObj ? itemObj.in_use : false,
    openedOn: itemObj
      ? itemObj.opened_on
        ? itemObj.opened_on
        : itemObj.in_use && !editItem
        ? getCurrentDate()
        : ""
      : "",
  });

  // Use state hook to manage the submitting state of the form.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use state hook to manage the editing state of the item.
  const [showEdit, setShowEdit] = useState(editItem);

  // Const containing the object returned by the isExpiryInSixMonths function
  const isExpiredObject = isExpiryInSixMonths(itemObj?.expiry);

  // Handle the form input changes and update the related state.
  const handleInputChange = (input) => {
    const { name, value } = input.target ? input.target : input;
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Toggle the editing state.
  const showEditItem = () => {
    setShowEdit(!showEdit);
  };

  // Reset the item state to the initial itemObject provided in props.
  const resetItem = () => {
    // if this component was rendered when creating a new item but was cancelled, remove that row
    if (showAddNewItem) showAddNewItem();

    setItemData({
      batch: itemObj ? itemObj.batch : "",
      expiry: itemObj ? itemObj.expiry : "",
      inUse: itemObj ? itemObj.in_use : false,
      openedOn: itemObj ? itemObj.opened_on : "",
    });
  };

  // Handle form submission i.e updating or creating new item.
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Set the promise const depending on if creating or editing a stock item
    const stockItemPromise = itemObj
      ? updateStockItem(token, itemObj.id, itemData)
      : createStockItem(token, productId, itemData);

    stockItemPromise.then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          // Callback function on successful submission.
          if (!editItem) onSuccessfulSubmit(response.stockItem);
          response.toast(); // Triggers a success toast message.
          setIsSubmitting(false); // Resets the submitting state.
          showEditItem(); // Moves out of the editing mode.
        }, 1000);
      } else {
        // Displays an error toast if the submission fails.
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false); // Resets the submitting state.
      }
    });
  };

  // Handle the deletion of stock item.
  const handleDelete = () => {
    setIsSubmitting(true);

    // Call the deletion axios function
    deleteStockItem(token, itemObj.id).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          // Callback function on successful submission.
          onSuccessfulSubmit(itemObj, true);
          response.toast(); // Triggers a success toast message.
          setIsSubmitting(false); // Resets the submitting state.
        }, 1000);
      } else {
        // Displays an error toast if the submission fails.
        showToast(
          "An unexpected error occurred. Please try again in a little while.",
          "error",
          "top-right",
          3000,
        );
        setIsSubmitting(false); // Resets the submitting state.
      }
    });
  };

  return (
    <>
      {/* We create a new table row for each stock item */}
      <tr
        className={`text-center align-middle`}
        // style={itemObj.in_use ? { backgroundColor: "#ecec8c" } : null}
      >
        {/* This table data shows the index of the stock item (we add 1 because indices start at 0 while we want to start counting from 1)*/}
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {index + 1 || ""}
        </td>
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {itemObj?.id || "N/A"}
        </td>
        {/* Here we show the order id of the stock item if it exists */}
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {itemObj?.order ? (
            <OrderDetailModal orderId={itemObj.order.id} />
          ) : (
            "N/A"
          )}
        </td>
        {/* Here we show the order date of the stock item if it exists */}
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {itemObj?.order ? itemObj.order.arrival_date : "N/A"}
        </td>
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {/* This section is a conditional rendering. If showEdit is true, we display the batch number else we display the input to edit it*/}
          {showEdit ? (
            itemData.batch
          ) : (
            <Form.Control
              type="text"
              name="batch"
              value={itemData.batch}
              onChange={handleInputChange}
              style={{ textAlign: "center" }}
            />
          )}
        </td>
        <td
          style={
            itemData.expiry && isExpiredObject.expired
              ? { backgroundColor: "#f84f4f", color: "white" } // Red color takes precedence
              : itemData.inUse
              ? { backgroundColor: "#fafa98" } // Yellow color as secondary condition
              : null
          }
        >
          {/* Similar conditional rendering for expiry date of an item */}
          {showEdit ? (
            <>
              <div>{itemData.expiry}</div>
              {itemData.expiry && isExpiredObject.expired && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {isExpiredObject.timeTillExpiry}
                </div>
              )}
            </>
          ) : (
            <Form.Control
              type="date"
              name="expiry"
              value={itemData.expiry}
              onChange={handleInputChange}
              style={{ textAlign: "center" }}
            />
          )}
        </td>
        {/* Checkbox to indicate if the stock item is in use */}
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          <Form.Check
            className="bold-checkbox"
            type="checkbox"
            name="inUse"
            disabled={showEdit}
            checked={itemData.inUse}
            onChange={(e) => {
              setItemData({ ...itemData, inUse: e.target.checked });
            }}
          />
        </td>
        {/* Date indicating if and when the stock item was opened */}
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {showEdit ? (
            <>
              <div>{itemData.openedOn}</div>
            </>
          ) : (
            <Form.Control
              disabled={!itemData.inUse}
              type="date"
              name="openedOn"
              value={itemData.openedOn}
              onChange={handleInputChange}
              style={{ textAlign: "center" }}
            />
          )}
        </td>
        {/* Condition rendering for showing buttons based on various states (submitting/edit mode etc.) */}
        <td style={itemData.inUse ? { backgroundColor: "#fafa98" } : null}>
          {isSubmitting ? (
            /* When the form is submitting, display a spinner */
            <Spinner
              size="sm"
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
            />
          ) : (
            /* If the user is in edit mode, show save and cancel buttons, if not, show edit and delete buttons */
            <>
              {!showEdit ? (
                <>
                  <Button
                    variant=""
                    size="sm"
                    onClick={() => {
                      handleSubmit();
                    }}
                    className="rounded-edge-button-right"
                  >
                    {checkmarkIcon}
                  </Button>
                  <Button
                    variant=""
                    size="sm"
                    onClick={() => {
                      showEditItem();
                      resetItem();
                    }}
                  >
                    {invalidIcon}
                  </Button>
                </>
              ) : (
                itemObj && (
                  <>
                    <Button
                      variant=""
                      size="sm"
                      onClick={showEditItem}
                      className="me-1"
                    >
                      {editIcon}
                    </Button>
                    <Button
                      variant=""
                      size="sm"
                      onClick={() => {
                        setIsSubmitting(true);
                        handleDelete();
                      }}
                    >
                      {trashIcon}
                    </Button>
                  </>
                )
              )}
            </>
          )}
        </td>
      </tr>
    </>
  );
};
export default StockItemComponent;
