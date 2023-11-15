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

export default function SupplierSelect({
  handleClick,
  supplier,
  supplierList,
  handleChange,
}) {
  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="supplier-select-label">Supplier</InputLabel>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Select
          labelId="supplier-select-label"
          value={supplier}
          onChange={handleChange}
          label="Supplier"
          sx={{ flexGrow: 1 }}
        >
          <MenuItem value="" disabled>
            --Select Supplier--
          </MenuItem>
          {supplierList.map((choice, index) => (
            <MenuItem key={index} value={choice.value}>
              {choice.label}
            </MenuItem>
          ))}
        </Select>
        <Button
          sx={{
            height: 56,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: "none", // Remove the left border
            marginLeft: "-1px", // Adjust to align with the Select component
          }}
          variant="outlined"
          color="primary"
          onClick={handleClick}
        >
          <RefreshIcon />
        </Button>
      </Box>
    </FormControl>
  );
}
