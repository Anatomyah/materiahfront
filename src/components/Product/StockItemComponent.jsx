import React, { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";
import { AppContext } from "../../App";
import {
  createStockItem,
  deleteStockItem,
  updateProductItemStock,
  updateStockItem,
} from "../../clients/product_client";
import {
  formatDateStr,
  getCurrentDate,
  isExpiryInSixMonths,
  showToast,
  updateProductStockInProductList,
} from "../../config_and_helpers/helpers";
import OrderDetailModal from "../Order/OrderDetailModal";
import "./ProductComponentStyle.css";
import InventoryProgressBar from "../Generic/InventoryProgressBar";
import { PlusCircle, DashCircle } from "react-bootstrap-icons";
import { ProductContext } from "../../pages/Product/ProductList";

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
 * Represents a component for managing stock items.
 *
 * @param {object} StockItemComponent - The configuration object for the component.
 * @param {string} StockItemComponent.productId - The ID of the product.
 * @param {object} StockItemComponent.itemObj - The object representing the stock item.
 * @param {number} StockItemComponent.index - The index of the stock item.
 * @param {boolean} [StockItemComponent.editItem=false] - Indicates whether the stock item is being edited.
 * @param {function} StockItemComponent.showAddNewItem - A function for showing the add new item form.
 * @param {function} StockItemComponent.onSuccessfulSubmit - A function to be called after successful submission.
 * @param {number} StockItemComponent.unitQuantity - The unit quantity of the stock item.
 * @param {function} StockItemComponent.onStockUpdate - A function to be called after updating the stock.
 * @param {boolean} StockItemComponent.showBar - Indicates whether to show a bar in the component.
 */
const StockItemComponent = ({
  productId,
  itemObj,
  index,
  editItem = false,
  showAddNewItem,
  onSuccessfulSubmit,
  unitQuantity,
  onStockUpdate,
  showBar,
}) => {
  // Use the context hook to access the token.
  const { token } = useContext(AppContext);

  // Use the context hook to access the products array
  const { products, setProducts } = useContext(ProductContext);

  // Use the state hook to manage item data.
  // Initialize with the provided itemObject or an empty object if not provided.
  const [itemData, setItemData] = useState({
    id: itemObj ? itemObj.id : "",
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
    itemStock: itemObj ? itemObj?.item_sub_stock : "",
  });

  // Use state hook to manage the submitting state of the form.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use state hook to manage the editing state of the item.
  const [showEdit, setShowEdit] = useState(editItem);
  // useState to manage the presentation of the expiry date error message
  const [expiryDateError, setExpiryDateError] = useState(false);
  // useState to manage the presentation of the expiry date error message
  const [openedOnDateError, setOpenedOnDateError] = useState(false);

  // The error message for the date errors
  const dateYearError = "Year value must be 4 digits long";

  // useEffect to update the item stock in case the unit value for the product is edited
  useEffect(() => {
    if (itemData.itemStock > unitQuantity) {
      setItemData((prevItemData) => ({
        ...prevItemData,
        itemStock: Number(unitQuantity),
      }));
    }
  }, [unitQuantity]);

  // Const containing the object returned by the isExpiryInSixMonths function
  const isExpiredObject = isExpiryInSixMonths(itemData?.expiry);

  // Function used to handle the inputChange from the stockItem form
  const handleInputChange = (input) => {
    // Destructure the name and value properties from the input object
    const { name, value } = input.target ? input.target : input;

    // Check if the name of the input is either "openedOn" or "expiry"
    if (name === "openedOn" || name === "expiry") {
      // Convert the input value to a date
      const date = new Date(value);

      // Extract the year from the date
      const year = date.getFullYear();

      // Check if the year extracted from the date has more than 4 characters or not a number
      if (year.toString().length > 4 || isNaN(year)) {
        // If the name of the input is "openedOn", set an error for the "openedOn" date
        if (name === "openedOn") {
          setOpenedOnDateError(true);

          // If the name of the input is "expiry", set an error for the "expiry" date
        } else if (name === "expiry") {
          setExpiryDateError(true);
        }
      } else {
        // If the year is valid and the name of the input is "openedOn", clear any "openedOn" date errors
        if (name === "openedOn") {
          setOpenedOnDateError(false);

          // If the year is valid and the name of the input is "expiry", clear any "expiry" date errors
        } else if (name === "expiry") {
          setExpiryDateError(false);
        }
      }
    }

    // Update the item data state with the new value from the input
    setItemData((prevData) => ({
      ...prevData,
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
      itemStock: itemObj ? itemObj.item_sub_stock : "",
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
          if (!editItem) onSuccessfulSubmit(response.data);
          response.toast(); // Triggers a success toast message.
          setIsSubmitting(false); // Resets the submitting state.
          setProducts(
            updateProductStockInProductList(products, productId, "add"),
          );
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
          setProducts(
            updateProductStockInProductList(products, productId, "subtract"),
          );
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

  // Handle the updating of stock
  const handleUpdateStock = (updatedValue) => {
    setItemData((prevState) => ({
      ...prevState,
      itemStock: updatedValue,
    }));
  };

  const handleSubmitUpdateStock = (action) => {
    setIsSubmitting(true);
    const updatedStock =
      action === "add" ? itemData.itemStock + 1 : itemData.itemStock - 1;

    // Call the deletion axios function
    updateProductItemStock(token, itemObj.id, updatedStock).then((response) => {
      if (response && response.success) {
        setTimeout(() => {
          handleUpdateStock(updatedStock);
          onStockUpdate(action);
          response.toast(); // Triggers a success toast message.
          setIsSubmitting(false); // Resets the submitting state.
          // If the item stock equals to 1 prior to the deletion process, delete the stock item
          if (itemData.itemStock === 1) {
            handleDelete();
          }
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
              <div>{itemData.expiry ? formatDateStr(itemData.expiry) : ""}</div>
              {itemData.expiry && isExpiredObject.expired && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {isExpiredObject.timeTillExpiry}
                </div>
              )}
            </>
          ) : (
            <Form.Group>
              <Form.Control
                type="date"
                name="expiry"
                value={itemData.expiry}
                onChange={handleInputChange}
                style={{ textAlign: "center" }}
                isInvalid={expiryDateError}
              />
              <Form.Control.Feedback type="invalid">
                {dateYearError}
              </Form.Control.Feedback>
            </Form.Group>
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
              <div>
                {itemData.openedOn ? formatDateStr(itemData.openedOn) : ""}
              </div>
            </>
          ) : (
            <Form.Group>
              <Form.Control
                disabled={!itemData.inUse}
                type="date"
                name="openedOn"
                value={itemData.openedOn}
                onChange={handleInputChange}
                style={{ textAlign: "center" }}
                isInvalid={openedOnDateError}
              />
              <Form.Control.Feedback type="invalid">
                {dateYearError}
              </Form.Control.Feedback>
            </Form.Group>
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
                    disabled={expiryDateError || openedOnDateError}
                  >
                    {checkmarkIcon}
                  </Button>
                  <Button
                    variant=""
                    size="sm"
                    onClick={() => {
                      showEditItem();
                      resetItem();
                      setExpiryDateError(false);
                      setOpenedOnDateError(false);
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
      {/* If the item unit is Box or Package, a bar and buttons will appear to display and control the stock inside
       that box or package */}
      {itemObj && itemData.inUse && showBar ? (
        <tr className={`text-center align-middle`}>
          <td colSpan={8}>
            <InventoryProgressBar
              currentValue={itemData.itemStock}
              totalValue={unitQuantity}
            />
          </td>
          <td>
            <Button
              variant=""
              size="lg"
              onClick={handleSubmitUpdateStock}
              className="me-1"
            >
              <DashCircle />
            </Button>
            <Button
              variant=""
              size="lg"
              onClick={() => handleSubmitUpdateStock("add")}
            >
              <PlusCircle />
            </Button>
          </td>
        </tr>
      ) : null}
    </>
  );
};
export default StockItemComponent;
