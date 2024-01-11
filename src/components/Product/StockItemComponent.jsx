import React, { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {
  createStockItem,
  deleteStockItem,
  updateStockItem,
} from "../../clients/product_client";
import { showToast } from "../../config_and_helpers/helpers";
import { Spinner } from "react-bootstrap";
import { AppContext } from "../../App";
import "./ProductComponentStyle.css";
import OrderDetailModal from "../Order/OrderDetailModal";

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
  });

  useEffect(() => {
    console.log(itemObj);
  }, [itemObj]);

  // Use state hook to manage the submitting state of the form.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use state hook to manage the editing state of the item.
  const [showEdit, setShowEdit] = useState(editItem);

  // Handle the form input changes and update the related state.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
        );
        setIsSubmitting(false); // Resets the submitting state.
      }
    });
  };

  return (
    <>
      {/* We create a new table row for each stock item */}
      <tr
        className={`text-center align-middle ${
          itemData.inUse && showEdit && "in-use-item"
        }`}
      >
        {/* This table data shows the index of the stock item (we add 1 because indices start at 0 while we want to start counting from 1)*/}
        <td>{index + 1 || ""}</td>
        {/* Here we show the order id of the stock item if it exists */}
        <td>
          {itemObj?.order ? (
            <OrderDetailModal orderId={itemObj.order.id} />
          ) : (
            "N/A"
          )}
        </td>
        {/* Here we show the order date of the stock item if it exists */}
        <td>{itemObj?.order ? itemObj.order.arrival_date : "N/A"}</td>
        <td>
          {/* This section is a conditional rendering. If showEdit is true, we display the batch number else we display the input to edit it*/}
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
          {/* Similar conditional rendering for expiry date of an item */}
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
        {/* Checkbox to indicate if the stock item is in use */}
        <td>
          <Form.Check
            type="checkbox"
            name="inUse"
            disabled={showEdit}
            checked={itemData.inUse}
            onChange={(e) =>
              setItemData({ ...itemData, inUse: e.target.checked })
            }
          />
        </td>
        {/* Condition rendering for showing buttons based on various states (submitting/edit mode etc.) */}
        <td>
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
