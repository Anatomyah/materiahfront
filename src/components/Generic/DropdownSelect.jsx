import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ListItemText, MenuItem } from "@mui/material";

const DropdownSelect = ({
  optionsList,
  label,
  selectedValue,
  setSelectedValue,
  disabledOptions,
}) => {
  console.log(label);
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
      renderOption={(props, option) => (
        <MenuItem {...props} disabled={disabledOptions.includes(option.value)}>
          <ListItemText primary={option.label} />
        </MenuItem>
      )}
      disableClearable
    />
  );
};
export default DropdownSelect;
