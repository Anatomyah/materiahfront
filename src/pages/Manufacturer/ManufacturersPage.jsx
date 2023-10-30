import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { getManufacturers } from "../../clients/manufacturer_client";
import { useNavigate } from "react-router-dom";
import CreateManufacturerModal from "../../components/Manufacturer/CreateManufacturerModal";
import InfiniteScroll from "react-infinite-scroller";
import TextField from "@mui/material/TextField";

const ManufacturersPage = () => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [manufacturers, setManufacturers] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchManufacturers = ({ searchValue = "", nextPage = null } = {}) => {
    getManufacturers(token, setManufacturers, {
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
    fetchManufacturers({
      searchValue: searchInput,
      nextPage: null,
    });
  }, [searchInput]);

  const goToManufacturerDetails = (manufacturer) => {
    nav(`/manufacturer-details/${manufacturer.id}`, {
      state: { manufacturer },
    });
  };

  useEffect(() => {
    console.log(manufacturers);
  }, [manufacturers]);

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);

    setTypingTimeout(newTimeout);
  };

  return (
    <div>
      <CreateManufacturerModal onSuccessfulCreate={fetchManufacturers} />
      <TextField
        id="outlined-helperText"
        label="Free text search"
        onChange={(e) => handleSearchInput(e.target.value)}
      />
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          fetchManufacturers({
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
        {manufacturers.map((manufacturer) => (
          <span
            key={manufacturer.id}
            className="text-decoration-underline text-primary"
            style={{ cursor: "pointer", minHeight: 500, display: "block" }}
            onClick={() => goToManufacturerDetails(manufacturer)}
          >
            {manufacturer.name}
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
export default ManufacturersPage;
