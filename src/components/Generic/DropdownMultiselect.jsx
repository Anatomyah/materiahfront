import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

/**
 * A DropdownMultiselect Component using the MUI Autocomplete.
 *
 * DropdownMultiselect is a multi-select dropdown component. It allows the user to select multiple options from the dropdown list.
 * The component receives an optionsList and selectedValues as props and also accepts a callback function to update the selectedValues as the options are selected/unselected by the user.
 * The optionsList should be an array of objects where each object should be in the format { value: VALUE, label: LABEL }.
 * The selectedValues should also follow the same data structure.
 *
 * @component
 *
 * @prop {Array<Object>} optionsList - Array of objects where each object should contain the `value` and `label` properties for the dropdown options.
 * - `value`: number | string
 * - `label`: string
 * @prop {Array<Object>} selectedValues - Array of objects where each object should contain the `value` and `label` properties for the selected dropdown option/s.
 * - `value`: number | string
 * - `label`: string
 * @prop {Function} setSelectedValues - A callback function that updates the `selectedValues`.
 * @prop {string} placeholder - Placeholder for the dropdown.
 *
 * @example
 *
 * const options = [{value: 'value1', label: 'Option 1'}, {value: 'value2', label: 'Option 2 '}];
 *  let selectedValues = [];
 *  function setSelectedValues(values) {
 *     selectedValues = values;
 *   }
 *
 *   return (
 *     <DropdownMultiselect
 *       optionsList={options}
 *       selectedValues={selectedValues}
 *       setSelectedValues={setSelectedValues}
 *       placeholder='Options'
 *     />
 *   );
 *
 *   @returns {React.Node} - The DropdownMultiselect component
 */

export default function DropdownMultiselect({
  optionsList,
  selectedValues,
  setSelectedValues,
  placeholder,
}) {
  // Event handler to update selectedValues when an option is selected/unselected
  const handleChange = (event, newValue) => {
    setSelectedValues(newValue);
  };

  return (
    <Autocomplete
      multiple // Allows selection of multiple options
      id="dropdown_multiselect"
      options={optionsList} // Options to display in dropdown
      value={selectedValues} // The currently selected values
      onChange={handleChange} // Calls the handleChange function on option select/unselect
      getOptionLabel={(option) => option.label} // Defines how option labels are displayed
      isOptionEqualToValue={(option, value) => option.value === value.value} // Determines equality of option values
      // Renders input field in dropdown
      renderInput={(params) => (
        <TextField {...params} label={`Related ${placeholder}`} />
      )}
    />
  );
}
