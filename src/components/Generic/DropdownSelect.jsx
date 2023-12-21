import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ListItemText, MenuItem } from "@mui/material";

/**
 * The `DropdownSelect` component represents a reusable dropdown select box using Material-UI's `Autocomplete` and `TextField` components.
 *
 * The component receives an optionsList, label for the select box, selectedValue for controlled component, a setSelectedValue callback function to update the selected value and list of disabledOptions as props.
 * It is designed to have controlled inputs, and the selectedValue should be managed in the parent component state and should be passed down to this dropdown select component as a prop.
 * The optionsList should be an array of objects where each object should be in the format { value: VALUE, label: LABEL }.
 * The selectedValue should be of the same type as individual items of the optionsList array.
 *
 * @component
 *
 * @prop {Array<Object>} optionsList - Array of objects where each object should contain the `value` and `label` properties for the dropdown options.
 * - `value`: number | string
 * - `label`: string
 * @prop {string} label - Label to be displayed for the Dropdown select box.
 * @prop {string | number | null} selectedValue - Selected value.
 * @prop {Function} setSelectedValue - A callback function that updates the `selectedValue`.
 * @prop {Array<string | number>} disabledOptions - Array of option values that should be disabled in the dropdown.
 *
 * @example
 *
 * const options = [{value: 'value1', label: 'Option 1'}, {value: 'value2', label: 'Option 2'}];
 * let selectedValue = options[0];
 * function setSelectedValue(value) {
 *   selectedValue = value;
 * }
 * const disabledOptions = ['value2']
 *
 * return (
 *   <DropdownSelect
 *     optionsList={options}
 *     label="Dropdown Label"
 *     selectedValue={selectedValue}
 *     setSelectedValue={setSelectedValue}
 *     disabledOptions={disabledOptions}
 *   />
 * );
 *
 * @returns {React.Node} - The DropdownSelect component
 */
const DropdownSelect = ({
  optionsList,
  label,
  selectedValue,
  setSelectedValue,
  disabledOptions,
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
      renderInput={(params) => <TextField {...params} label={label} />} // Callback used to display TextField component
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
