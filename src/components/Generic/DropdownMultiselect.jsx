import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export default function DropdownMultiselect({
  optionsList,
  selectedValues,
  setSelectedValues,
}) {
  const handleChange = (event, newValue) => {
    setSelectedValues(newValue);
  };

  return (
    <Autocomplete
      multiple
      id="dropdown_multiselect"
      options={optionsList}
      value={selectedValues}
      onChange={handleChange}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => (
        <TextField {...params} label="Related Manufacturers" />
      )}
    />
  );
}
