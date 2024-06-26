import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ListItemText, MenuItem } from "@mui/material";

/**
 * Renders a dropdown select component with autocomplete functionality.
 *
 * @param {Object} props - The required props for the DropdownSelect component.
 * @param {Array} props.optionsList - An array of options to populate the dropdown list.
 * @param {string} props.label - The label for the dropdown select component.
 * @param {any} props.selectedValue - The currently selected value in the dropdown.
 * @param {function} props.setSelectedValue - Callback function to update the selected value.
 * @param {Array} props.disabledOptions - An array of values that should be disabled in the dropdown select.
 * @param {boolean} props.touched - Indicates whether the dropdown select has been interacted with.
 * @param {string} props.error - Error message to display for validation errors.
 * @param {boolean} props.isInvalid - Indicates whether the dropdown select has a validation error.
 * @param {function} props.onBlur - Callback function to handle onBlur event.
 * @returns {HTMLElement} - The rendered DropdownSelect component.
 */
const DropdownSelect = ({
  optionsList,
  label,
  selectedValue,
  setSelectedValue,
  disabledOptions,
  touched,
  error,
  isInvalid,
  onBlur,
}) => {
  return (
    <Autocomplete
      disablePortal // Disable the portal for rendering the autocomplete options
      id="dropdown_select" // Unique identifier for the Autocomplete input
      options={optionsList} // Array of options to populate dropdown list
      sx={{ width: 300 }} // Defines the width of the text
      value={selectedValue !== undefined ? selectedValue : null} // The currently selected value in the DropdownSelect
      isOptionEqualToValue={(option, value) =>
        option.value === (value ? value.value : null)
      } // Callback used to determine if the selected option matches the value in the TextField
      getOptionLabel={(option) => String(option.label)} // Callback used to return the label for the selected option
      onChange={(event, newValue) => {
        setSelectedValue(newValue ? newValue : null);
      }} // Event handler to update the selected value in the parent component when an option is selected in the dropdown
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={touched && Boolean(isInvalid)}
          helperText={isInvalid && error}
          onBlur={onBlur}
        />
      )} // Callback used to display TextField component
      renderOption={(props, option) => (
        <MenuItem {...props} disabled={disabledOptions.includes(option.value)}>
          <ListItemText primary={option.label} />
        </MenuItem>
      )} // Callback used to customize how options are rendered in the dropdown menu
      disableClearable // Disables the option to clear the selected value in the dropdown select
    />
  );
};
export default DropdownSelect;
