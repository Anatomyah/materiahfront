import * as React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * A `SupplierSelect` Component using Material-UI components.
 *
 * SupplierSelect is a select dropdown component structured with a refresh button aside the dropdown.
 * The component receives a `handleClick` function that handles what occurs when the button is clicked,
 * `supplier` which holds the current value of the dropdown,
 * `supplierList` array which holds the option values of the dropdown and
 * `handleChange` function which handles the changes on option selection.
 *
 * @component
 *
 * @prop {Function} handleClick - Function to handle button click.
 * @prop {string | number} supplier - The value for the dropdown.
 * @prop {Array<{value: string | number, label: string}>} supplierList - Array of objects for the dropdown. Each object should contain a `value` and `label`.
 * @prop {Function} handleChange - Function to handle dropdown option selection.
 *
 * @example
 *
 * const supplierList = [
 *   { value: 'supplier1', label: 'Supplier 1' },
 *   { value: 'supplier2', label: 'Supplier 2' },
 * ];
 * let supplier = supplierList[0].value;
 * const handleChange = (event) => {
 *   supplier = event.target.value;
 * }
 * const handleClick = () => {
 *   // Refresh logic here
 * };
 *
 * return (
 *   <SupplierSelect
 *     handleClick={handleClick}
 *     supplier={supplier}
 *     supplierList={supplierList}
 *     handleChange={handleChange}
 *   />
 * );
 *
 */
export default function SupplierSelect({
  handleClick,
  supplier,
  supplierList,
  handleChange,
}) {
  return (
    // Defines a portion of the form
    <FormControl sx={{ m: 1, width: 300 }}>
      {/* Defines a label for the dropdown */}
      <InputLabel id="supplier-select-label">Supplier</InputLabel>

      {/* Container for dropdown and button */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Supplier dropdown */}
        <Select
          labelId="supplier-select-label" // id of the label associated with this dropdown
          value={supplier} // The value of the selected option in the dropdown
          onChange={handleChange} // Event handler for dropdown option selection
          label="Supplier" // The label to display for the dropdown
          sx={{ flexGrow: 1 }} // CSS for dropdown
        >
          {/* Default option */}
          <MenuItem value="" disabled>
            --Select Supplier--
          </MenuItem>

          {/* Populate dropdown with supplierList */}
          {supplierList.map((choice, index) => (
            <MenuItem key={index} value={choice.value}>
              {choice.label}
            </MenuItem>
          ))}
        </Select>

        {/* Refresh button */}
        <Button
          sx={{
            height: 56,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: "none",
            marginLeft: "-1px",
          }}
          variant="outlined"
          color="primary"
          onClick={handleClick} // Event handler for button click
        >
          <RefreshIcon />
        </Button>
      </Box>
    </FormControl>
  );
}
