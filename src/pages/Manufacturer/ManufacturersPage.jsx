import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import { getManufacturers } from "../../clients/manufacturer_client";
import ManufacturerModal from "../../components/Manufacturer/ManufacturerModal";
import InfiniteScroll from "react-infinite-scroller";
import {
  extractEntitiesSelectList,
  filterObjectsByEntity,
  showToast,
} from "../../config_and_helpers/helpers";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import SearchIcon from "@mui/icons-material/Search";
import Form from "react-bootstrap/Form";
import RefreshIcon from "@mui/icons-material/Refresh";
import Container from "react-bootstrap/Container";
import ManufacturerTable from "../../components/Manufacturer/ManufacturerTable";
import { Spinner } from "react-bootstrap";

const ManufacturersPage = () => {
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const { token } = useContext(AppContext);
  const [viewManufacturers, setViewManufacturers] = useState([]);
  const [baseManufacturers, setBaseManufacturers] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (!baseManufacturers.length) return;
    if (baseManufacturers) {
      extractEntitiesSelectList(
        baseManufacturers,
        setSupplierSelectList,
        "supplier",
      );
    }
  }, [baseManufacturers]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!supplier) {
      setViewManufacturers([]);
    }

    filterObjectsByEntity(
      supplier,
      baseManufacturers,
      setViewManufacturers,
      "supplier",
    );
  }, [supplier]);

  const fetchManufacturers = ({ searchValue = "", nextPage = null } = {}) => {
    isLoadingRef.current = true;
    getManufacturers(token, setBaseManufacturers, {
      searchInput: searchValue,
      nextPage: nextPage,
    }).then((response) => {
      if (response && response.success) {
        if (response.reachedEnd) {
          setNextPageUrl(null);
          setHasMore(false);
        } else {
          setNextPageUrl(response.nextPage);
          setHasMore(true);
        }
      } else {
        showToast(
          "An unexpected error occurred. Please try again",
          "danger",
          "top-center",
        );
      }
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    fetchManufacturers({
      searchValue: searchInput,
      nextPage: null,
    });
  }, [searchInput]);

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);

    setTypingTimeout(newTimeout);
  };

  if (isLoadingRef.current) {
    return (
      <Spinner
        size="lg"
        as="span"
        animation="border"
        role="status"
        aria-hidden="true"
      />
    );
  }

  return (
    <div>
      <Container className="my-3">
        <Row className="align-items-center justify-content-md-evenly">
          <Col md="auto" className="m">
            <ManufacturerModal onSuccessfulSubmit={fetchManufacturers} />
          </Col>
          <Col xs={5} className="ms-2">
            <InputGroup>
              <InputGroup.Text id="basic-addon1">
                <SearchIcon />
              </InputGroup.Text>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Free Search"
                aria-label="Search "
                aria-describedby="basic-addon1"
                onChange={(e) => handleSearchInput(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md="auto" sm>
            {supplierSelectList && (
              <InputGroup>
                <Form.Select
                  value={supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    -- Select Supplier --
                  </option>
                  {supplierSelectList.map((choice, index) => (
                    <option key={index} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </Form.Select>
                <InputGroup.Text
                  onClick={() => setSupplier("")}
                  style={{ cursor: "pointer" }}
                >
                  <RefreshIcon />
                </InputGroup.Text>
              </InputGroup>
            )}
          </Col>
        </Row>
      </Container>
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
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
        <ManufacturerTable
          manufacturerList={
            viewManufacturers.length ? viewManufacturers : baseManufacturers
          }
          handleEdit={fetchManufacturers}
        />
      </InfiniteScroll>
    </div>
  );
};
export default ManufacturersPage;
