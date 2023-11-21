import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../App";
import { getSuppliers } from "../../clients/supplier_client";
import SupplierModal from "../../components/Supplier/SupplierModal";
import InfiniteScroll from "react-infinite-scroller";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import SearchIcon from "@mui/icons-material/Search";
import Form from "react-bootstrap/Form";
import RefreshIcon from "@mui/icons-material/Refresh";
import Container from "react-bootstrap/Container";
import {
  extractEntitiesSelectList,
  filterObjectsByEntity,
  showToast,
} from "../../config_and_helpers/helpers";
import SupplierTable from "../../components/Supplier/SupplierTable";
import { Spinner } from "react-bootstrap";
import debounce from "lodash/debounce";

const SuppliersPage = () => {
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const { token } = useContext(AppContext);
  const [baseSuppliers, setBaseSuppliers] = useState([]);
  const [viewSuppliers, setViewSuppliers] = useState([]);
  const [manufacturerSelectList, setManufacturerSelectList] = useState([]);
  const [manufacturer, setManufacturer] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (!baseSuppliers.length) return;
    if (baseSuppliers) {
      extractEntitiesSelectList(
        baseSuppliers,
        setManufacturerSelectList,
        "manufacturer",
      );
    }
  }, [baseSuppliers]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!manufacturer) {
      setViewSuppliers([]);
    }

    filterObjectsByEntity(
      manufacturer,
      baseSuppliers,
      setViewSuppliers,
      "manufacturer",
    );
  }, [manufacturer]);

  const fetchSuppliers = ({ searchValue = "", nextPage = null } = {}) => {
    isLoadingRef.current = true;
    getSuppliers(token, setBaseSuppliers, {
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
    fetchSuppliers({
      searchValue: searchInput,
      nextPage: null,
    });
  }, [searchInput]);

  const handleSearchInput = useCallback(
    debounce((value) => {
      setSearchInput(value);
    }, 500),
    [],
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchInput(event.target.value);
    }
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
            <SupplierModal onSuccessfulSubmit={fetchSuppliers} />
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
                onKeyDown={handleKeyDown}
              />
            </InputGroup>
          </Col>
          <Col md="auto" sm>
            {manufacturerSelectList && (
              <InputGroup>
                <Form.Select
                  value={manufacturer}
                  onChange={(e) => {
                    setManufacturer(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    -- Select Manufacturer --
                  </option>
                  {manufacturerSelectList.map((choice, index) => (
                    <option key={index} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </Form.Select>
                <InputGroup.Text
                  onClick={() => setManufacturer("")}
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
          fetchSuppliers({
            searchValue: searchInput,
            nextPage: nextPageUrl,
          });
        }}
        hasMore={hasMore}
        loader={
          <Spinner
            className="loader"
            key={0}
            size="lg"
            as="span"
            animation="border"
            role="status"
            aria-hidden="true"
          />
        }
      >
        <SupplierTable
          supplierList={viewSuppliers.length ? viewSuppliers : baseSuppliers}
          handleEdit={fetchSuppliers}
        />
      </InfiniteScroll>
    </div>
  );
};
export default SuppliersPage;
