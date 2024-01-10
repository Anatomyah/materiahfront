import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import debounce from "lodash/debounce";

/**
 * ManufacturersPage is a React functional component responsible for displaying
 * the manufacturers page. It allows users to search, view, and interact with
 * manufacturers data. The component handles data fetching, search functionality,
 * and pagination through infinite scrolling. It also includes a modal for adding
 * or editing manufacturers and filtering options based on supplier.
 *
 * @returns {JSX.Element} The ManufacturersPage component.
 */
const ManufacturersPage = () => {
  // useRef hooks for maintaining state without triggering re-renders
  const isLoadingRef = useRef(false); // Tracks if data is currently being loaded
  const isMountedRef = useRef(false); // Tracks if the component is mounted

  // useContext hook to access the global context
  const { token } = useContext(AppContext); // Accesses the authentication token from the AppContext

  // useState hooks for managing local state
  const [viewManufacturers, setViewManufacturers] = useState([]); // State for manufacturers to display
  const [baseManufacturers, setBaseManufacturers] = useState([]); // Base state for all fetched manufacturers
  const [supplierSelectList, setSupplierSelectList] = useState([]); // State for the list of suppliers for filtering
  const [supplier, setSupplier] = useState(""); // State for selected supplier filter
  const [nextPageUrl, setNextPageUrl] = useState(null); // State for the URL of the next page (pagination)
  const [hasMore, setHasMore] = useState(true); // State to track if more data is available for loading
  const [searchInput, setSearchInput] = useState(""); // State for the search input value

  // useEffect hook for setting supplier select list
  useEffect(() => {
    if (!baseManufacturers.length) return; // Prevents the effect from running if there are no manufacturers
    extractEntitiesSelectList(
      baseManufacturers,
      setSupplierSelectList,
      "supplier",
    ); // Extracts suppliers from the manufacturers list for the select dropdown
  }, [baseManufacturers]);

  // useEffect hook for filtering manufacturers based on the selected supplier
  useEffect(() => {
    if (!isMountedRef.current) return; // Prevents the effect from running on initial render
    if (!supplier) {
      setViewManufacturers([]); // Resets the viewManufacturers if no supplier is selected
    }

    filterObjectsByEntity(
      supplier,
      baseManufacturers,
      setViewManufacturers,
      "supplier",
    ); // Filters the manufacturers based on the selected supplier
  }, [supplier]);

  // Function to fetch manufacturers data
  const fetchManufacturers = ({ searchValue = "", nextPage = null } = {}) => {
    isLoadingRef.current = true; // Indicates the start of a data loading process
    getManufacturers(token, setBaseManufacturers, {
      searchInput: searchValue,
      nextPage: nextPage,
    }).then((response) => {
      if (response && response.success) {
        if (response.reachedEnd) {
          // If the end of data is reached
          setNextPageUrl(null); // Resets nextPageUrl as there's no more data
          setHasMore(false); // Indicates that there's no more data to load
        } else {
          setNextPageUrl(response.nextPage); // Updates nextPageUrl for pagination
          setHasMore(true); // Indicates that more data is available
        }
      } else {
        showToast(
          "An unexpected error occurred. Please try again",
          "error",
          "top-center",
        ); // Displays an error message if fetching fails
      }
      isLoadingRef.current = false; // Indicates the end of a data loading process
    });
  };

  // useEffect hook for fetching manufacturers based on search input
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true; // Sets the component as mounted
      return;
    }

    fetchManufacturers({
      searchValue: searchInput,
      nextPage: null,
    }); // Fetches manufacturers based on the current search input
  }, [searchInput]);

  // Debounced function for handling search input changes
  const handleSearchInput = useCallback(
    debounce((value) => {
      setSearchInput(value); // Updates the search input state
    }, 500),
    [],
  );

  // Function to handle key down event on search input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchInput(event.target.value); // Sets the search input when Enter key is pressed
    }
  };

  // Conditional rendering for the loading state
  if (isLoadingRef.current) {
    return (
      <Spinner
        size="lg"
        as="span"
        animation="border"
        role="status"
        aria-hidden="true"
      /> // Displays a spinner when data is being loaded
    );
  }

  return (
    <div>
      {/* Container for layout and spacing */}
      <Container className="my-3">
        {/* Row for alignment and spacing of child components */}
        <Row className="align-items-center justify-content-md-evenly">
          {/* Column for the ManufacturerModal component */}
          <Col md="auto" className="m">
            <ManufacturerModal onSuccessfulSubmit={fetchManufacturers} />
            {/* ManufacturerModal triggers fetchManufacturers on successful submit */}
          </Col>

          {/* Column for the search input */}
          <Col xs={5} className="ms-2">
            <InputGroup>
              <InputGroup.Text id="basic-addon1">
                <SearchIcon /> {/* Icon for search input */}
              </InputGroup.Text>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Free Search"
                aria-label="Search "
                aria-describedby="basic-addon1"
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                // Input for free text search, triggers handleSearchInput and handleKeyDown
              />
            </InputGroup>
          </Col>

          {/* Column for the supplier filter dropdown */}
          <Col md="auto" sm>
            {supplierSelectList && (
              <InputGroup>
                <Form.Select
                  value={supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                    {
                      /* Dropdown for selecting a supplier, sets supplier state */
                    }
                  }}
                >
                  <option value="" disabled>
                    -- Select Supplier --
                  </option>
                  {supplierSelectList.map((choice, index) => (
                    <option key={index} value={choice.id}>
                      {choice.name}
                      {/* Options for each supplier in the supplierSelectList */}
                    </option>
                  ))}
                </Form.Select>
                <InputGroup.Text
                  onClick={() => setSupplier("")}
                  style={{ cursor: "pointer" }}
                >
                  <RefreshIcon />
                  {/* Icon to clear the supplier filter */}
                </InputGroup.Text>
              </InputGroup>
            )}
          </Col>
        </Row>
      </Container>

      {/* InfiniteScroll component for lazy loading of manufacturer data */}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
          fetchManufacturers({
            searchValue: searchInput,
            nextPage: nextPageUrl,
          });
          {
            /* Triggers fetchManufacturers for more data when scrolled to the bottom */
          }
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
          // Spinner displayed while data is loading
        }
      >
        {/* ManufacturerTable displays the list of manufacturers */}
        <ManufacturerTable
          manufacturerList={
            viewManufacturers.length ? viewManufacturers : baseManufacturers
          }
          handleEdit={fetchManufacturers}
          // Chooses between filtered or unfiltered list of manufacturers
        />
      </InfiniteScroll>
    </div>
  );
};
export default ManufacturersPage;
