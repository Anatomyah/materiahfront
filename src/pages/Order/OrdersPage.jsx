import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../App";
import { getOrders } from "../../clients/order_client";
import InfiniteScroll from "react-infinite-scroller";
import OrderModal from "../../components/Order/OrderModal";
import OrderTable from "../../components/Order/OrderTable";
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
import { Spinner } from "react-bootstrap";
import debounce from "lodash/debounce";

// Create the order context provided to all order related components
export const OrderContext = React.createContext({});

/**
 * OrdersPage is a React functional component for displaying and managing orders.
 * It includes functionalities such as search, filtering, and pagination through infinite scrolling.
 * The component integrates a modal for adding or editing orders.
 *
 * @returns {JSX.Element} The OrdersPage component.
 */
const OrdersPage = () => {
  // useContext to access global AppContext for authentication token
  const { token } = useContext(AppContext);
  // useContext to access the local OrderContext for purposes of re-rendering the product detail modals
  // when an order updates
  const [orderUpdated, setOrderUpdated] = useState(false);

  // useRef hooks for persistent values that don't trigger re-renders
  const isLoadingRef = useRef(false); // Tracks loading state of data fetching
  const isMountedRef = useRef(false); // Tracks if the component is mounted

  // useState hooks for managing component state
  const [baseOrders, setBaseOrders] = useState([]); // Array of all orders
  const [viewOrders, setViewOrders] = useState([]); // Array of orders to display (filtered or unfiltered)
  const [supplierSelectList, setSupplierSelectList] = useState([]); // Array for supplier select list
  const [supplier, setSupplier] = useState(""); // Current selected supplier for filtering
  const [nextPageUrl, setNextPageUrl] = useState(null); // URL for the next page of orders (pagination)
  const [hasMore, setHasMore] = useState(true); // Flag to indicate if more orders can be loaded
  const [searchInput, setSearchInput] = useState(""); // Current value of the search input

  // useEffect for updating supplierSelectList when baseOrders changes
  useEffect(() => {
    if (!baseOrders.length) return;
    extractEntitiesSelectList(baseOrders, setSupplierSelectList, "supplier");
  }, [baseOrders]);

  // useEffect for filtering viewOrders based on selected supplier
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!supplier) {
      setViewOrders([]);
    }

    filterObjectsByEntity(supplier, baseOrders, setViewOrders, "supplier");
  }, [supplier]);

  // Function to fetch orders data
  const fetchOrders = ({ searchValue = "", nextPage = null } = {}) => {
    isLoadingRef.current = true;
    getOrders(token, setBaseOrders, {
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

  // useEffect for fetching orders when searchInput changes
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    fetchOrders({ searchValue: searchInput, nextPage: null });
  }, [searchInput]);

  // Debounced function for handling search input changes
  const handleSearchInput = useCallback(
    debounce((value) => {
      setSearchInput(value);
    }, 500),
    [],
  );

  // Rests the search input value. passed down as prop to the children components to be used when necessary
  const resetSearchValue = () => {
    setSearchInput("");
  };

  // Function to handle 'Enter' key event on search input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchInput(event.target.value);
    }
  };

  // Conditional rendering for loading state
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
      {/* Container for overall layout and spacing */}
      <Container className="my-3">
        {/* Row for alignment and spacing of child components */}
        <Row className="align-items-center justify-content-md-evenly">
          {/* Column for the OrderModal component */}
          <Col md="auto" className="m">
            <OrderModal
              onSuccessfulSubmit={fetchOrders}
              clearSearchValue={resetSearchValue}
            />
            {/* OrderModal is used for adding or editing orders. It triggers fetchOrders on successful submission */}
          </Col>

          {/* Column for the search functionality */}
          <Col xs={5} className="ms-2">
            <InputGroup>
              <InputGroup.Text id="basic-addon1">
                <SearchIcon /> {/* Icon for search input */}
              </InputGroup.Text>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Free Search"
                aria-label="Search"
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
                  onChange={(e) => setSupplier(e.target.value)}
                  // Dropdown for selecting a supplier, updates supplier state
                >
                  <option value="" disabled>
                    -- Select Supplier --
                  </option>
                  {supplierSelectList.map((choice, index) => (
                    <option key={index} value={choice.id}>
                      {choice.name}
                    </option>
                    // Options for each supplier in the supplierSelectList
                  ))}
                </Form.Select>
                <InputGroup.Text
                  onClick={() => setSupplier("")}
                  style={{ cursor: "pointer" }}
                >
                  <RefreshIcon />
                  {/* Icon to clear the supplier filter selection */}
                </InputGroup.Text>
              </InputGroup>
            )}
          </Col>
        </Row>
      </Container>

      {/* InfiniteScroll component for lazy loading of orders */}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
          fetchOrders({ searchValue: searchInput, nextPage: nextPageUrl });
          // Triggers fetchOrders to load more orders when scrolled to the bottom
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
        {/* OrderTable displays the list of orders, nexted in the OrderContext provider */}
        <OrderContext.Provider value={{ orderUpdated, setOrderUpdated }}>
          <OrderTable
            orderList={viewOrders.length ? viewOrders : baseOrders}
            handleEdit={fetchOrders}
            clearSearchValue={resetSearchValue}
            // Chooses between filtered or unfiltered list of orders
          />
        </OrderContext.Provider>
      </InfiniteScroll>
    </div>
  );
};
export default OrdersPage;
