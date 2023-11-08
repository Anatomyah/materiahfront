import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const DropdownSelect = ({
  optionsList,
  label,
  selectedValue,
  setSelectedValue,
}) => {
  return (
    <Autocomplete
      disablePortal
      id="dropdown_select"
      options={optionsList}
      sx={{ width: 300 }}
      value={selectedValue !== undefined ? selectedValue : null}
      isOptionEqualToValue={(option, value) =>
        option.value === (value ? value.value : null)
      }
      getOptionLabel={(option) => String(option.label)}
      onChange={(event, newValue) => {
        setSelectedValue(newValue ? newValue : null);
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      disableClearable
    />
  );
};
export default DropdownSelect;
