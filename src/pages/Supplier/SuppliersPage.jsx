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

/**
 * Represents the suppliers page component in the application.
 *
 * This component handles the display and management of suppliers. It includes functionalities
 * like searching for suppliers, filtering by manufacturer, and infinite scrolling to load
 * more suppliers. It uses an InfiniteScroll component for lazy loading and a SupplierTable
 * component to display the list of suppliers.
 */
const SuppliersPage = () => {
  // Context to access the global token.
  const { token } = useContext(AppContext);

  // Refs to track loading state and component mount status.
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);

  // State hooks for supplier data management.
  const [baseSuppliers, setBaseSuppliers] = useState([]);
  const [viewSuppliers, setViewSuppliers] = useState([]);
  const [manufacturerSelectList, setManufacturerSelectList] = useState([]);
  const [manufacturer, setManufacturer] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // Effect hook to extract manufacturer select list once base suppliers are loaded.
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

  // Effect hook to filter suppliers based on selected manufacturer.
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

  // Function to fetch suppliers from the API with optional search and pagination.
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
          "error",
          "top-center",
          3000,
        );
      }
      isLoadingRef.current = false;
    });
  };

  // Effect hook to perform search operation with debounce.
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

  // Debounced function for search input handling.
  const handleSearchInput = useCallback(
    debounce((value) => {
      setSearchInput(value);
    }, 500),
    [],
  );

  // Function to handle key down event in the search input.
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchInput(event.target.value);
    }
  };

  // Conditional rendering to display a spinner during loading.
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
      {/* Main container for the supplier management interface */}
      <Container className="my-3">
        {/* Row for alignment and spacing of supplier management components */}
        <Row className="align-items-center justify-content-md-evenly">
          {/* Column for the supplier modal trigger */}
          <Col md="auto" className="m">
            {/* Supplier modal for adding or editing suppliers */}
            <SupplierModal onSuccessfulSubmit={fetchSuppliers} />
          </Col>

          {/* Column for the search input group */}
          <Col xs={5} className="ms-2">
            {/* Input group for search functionality */}
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

          {/* Column for the manufacturer filter dropdown */}
          <Col md="auto" sm>
            {/* Conditional rendering of manufacturer select list */}
            {manufacturerSelectList && (
              <InputGroup>
                {/* Dropdown for selecting a manufacturer */}
                <Form.Select
                  value={manufacturer}
                  onChange={(e) => {
                    setManufacturer(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    -- Filter by Manufacturer --
                  </option>
                  {/* Mapping through manufacturers for dropdown options */}
                  {manufacturerSelectList.map((choice, index) => (
                    <option key={index} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </Form.Select>

                {/* Refresh icon to clear the manufacturer filter */}
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
      {/* Infinite scroll component for lazy loading supplier data */}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          // Prevent multiple triggers if already loading
          if (isLoadingRef.current) return;
          // Fetch next page of suppliers
          fetchSuppliers({
            searchValue: searchInput,
            nextPage: nextPageUrl,
          });
        }}
        hasMore={hasMore}
        loader={
          // Spinner indicating loading state
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
        {/* Supplier table component for displaying supplier data */}
        <SupplierTable
          supplierList={viewSuppliers.length ? viewSuppliers : baseSuppliers}
          handleEdit={fetchSuppliers}
        />
      </InfiniteScroll>
    </div>
  );
};
export default SuppliersPage;
