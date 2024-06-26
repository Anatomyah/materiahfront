import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../App";
import { getSupplierSelectList } from "../../clients/supplier_client";
import { showToast } from "../../config_and_helpers/helpers";
import debounce from "lodash/debounce";
import { Spinner } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import SearchIcon from "@mui/icons-material/Search";
import Form from "react-bootstrap/Form";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfiniteScroll from "react-infinite-scroller";
import {
  getExpiryNotifications,
  getOrderNotifications,
} from "../../clients/notifications_client";
import NotificationsTable from "./NotificationsTable";

/**
 * Component for displaying a list of notifications.
 *
 * @param {Object} activeTab - The active tab in the component.
 * @returns {JSX.Element} - The NotificationsList component.
 */
const NotificationsList = ({ activeTab }) => {
  // State and context management.
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const [notifications, setNotifications] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // Fetching supplier select list on component mount.
  useEffect(() => {
    getSupplierSelectList(token, setSupplierSelectList);
  }, []);

  useEffect(() => {}, [notifications]);
  // Function to fetch notifications based on certain parameters.
  const fetchNotifications = ({
    searchValue = "",
    supplierId = "",
    nextPage = null,
  } = {}) => {
    isLoadingRef.current = true;

    // set the promise value based on the activeTab prop
    const notificationPromise =
      activeTab === "order"
        ? getOrderNotifications(token, setNotifications, {
            searchInput: searchValue,
            supplierId: supplierId,
            nextPage: nextPage,
          })
        : getExpiryNotifications(token, setNotifications, {
            searchInput: searchValue,
            supplierId: supplierId,
            nextPage: nextPage,
          });

    notificationPromise.then((response) => {
      // Processing response and setting state accordingly.
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

  // Fetch notifications whenever the supplier or search input changes.
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    fetchNotifications({
      supplierId: supplier,
      searchValue: searchInput,
      nextPage: null,
    });
  }, [supplier, searchInput]);

  // Rests the search input value. passed down as prop to the children components to be used when necessary
  const resetSearchValue = () => {
    setSearchInput("");
  };

  // Debounced handler for search input changes.
  const handleSearchInput = useCallback(
    debounce((value) => {
      setSearchInput(value);
    }, 500),
    [],
  );

  // Function to handle key press events in the search input field.
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchInput(event.target.value);
    }
  };

  // Render a spinner while loading.
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
      {/* Container for search and filtering UI */}
      <Container className="my-3">
        <Row className="align-items-center justify-content-md-evenly">
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
            <InputGroup>
              <Form.Select
                value={supplier}
                onChange={(e) => {
                  setNextPageUrl(null);
                  setSupplier(e.target.value);
                }}
              >
                <option value="" disabled>
                  -- Select Supplier --
                </option>
                {supplierSelectList.map((choice, index) => (
                  <option key={index} value={choice.value}>
                    {choice.label}
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
          </Col>
        </Row>
      </Container>
      {/* InfiniteScroll component for loading more notifications */}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
          fetchNotifications({
            supplierId: supplier,
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
        {/* Conditional rendering of the NotificationsTable for expiry or order notifications
        based on the activeTab prop */}
        {!notifications.length ? (
          <div>Nothing here...</div>
        ) : activeTab === "order" ? (
          <NotificationsTable
            notificationsList={notifications}
            handleEdit={fetchNotifications}
            clearSearchValue={resetSearchValue}
            activeTab="order"
          />
        ) : (
          <NotificationsTable
            notificationsList={notifications}
            handleEdit={fetchNotifications}
            activeTab="expiry"
            clearSearchValue={resetSearchValue}
          />
        )}
      </InfiniteScroll>
    </div>
  );
};
export default NotificationsList;
