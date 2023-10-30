import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { getSuppliers } from "../../clients/supplier_client";
import { useNavigate } from "react-router-dom";
import CreateSupplierModal from "../../components/Supplier/CreateSupplierModal";
import TextField from "@mui/material/TextField";
import InfiniteScroll from "react-infinite-scroller";

const SuppliersPage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [suppliers, setSuppliers] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchSuppliers = ({ searchValue = "", nextPage = null } = {}) => {
    getSuppliers(token, setSuppliers, {
      searchInput: searchValue,
      nextPage: nextPage,
    }).then((response) => {
      if (response && response.success) {
        if (response.reachedEnd) {
          setHasMore(false);
        } else {
          setNextPageUrl(response.nextPage);
          setHasMore(true);
        }
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  useEffect(() => {
    fetchSuppliers({
      searchValue: searchInput,
      nextPage: null,
    });
  }, [searchInput]);

  const goToSupplierDetails = (supplier) => {
    nav(`/supplier-details/${supplier.id}`, {
      state: { supplier },
    });
  };

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);
    setNextPageUrl(null);
    setTypingTimeout(newTimeout);
  };

  return (
    <div>
      <div>
        <CreateSupplierModal onSuccessfulCreate={fetchSuppliers} />
      </div>
      <TextField
        id="outlined-helperText"
        label="Free text search"
        onChange={(e) => handleSearchInput(e.target.value)}
      />
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          fetchSuppliers({
            searchValue: searchInput,
            nextPage: nextPageUrl,
          });
        }}
        hasMore={hasMore}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {suppliers.map((supplier) => (
          <span
            key={supplier.id}
            className="text-decoration-underline text-primary"
            style={{ cursor: "pointer", minHeight: 500, display: "block" }}
            onClick={() => goToSupplierDetails(supplier)}
          >
            {supplier.name}
          </span>
        ))}
      </InfiniteScroll>
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default SuppliersPage;
