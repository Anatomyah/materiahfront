import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../App";
import { getQuotes } from "../../clients/quote_client";
import QuoteModal from "../../components/Quote/QuoteModal";
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
import QuoteTable from "../../components/Quote/QuoteTable";
import { Spinner } from "react-bootstrap";
import debounce from "lodash/debounce";

/**
 * Component: QuotesPage
 *
 * @description
 * This component renders a page for displaying quotes with functionalities like
 * search, filtering by supplier, and infinite scrolling. It makes use of the InfiniteScroll
 * component for loading more quotes on scroll and includes the QuoteModal for creating new quotes.
 */

const QuotesPage = () => {
  // Context and state initialization
  const { token } = useContext(AppContext); // Accessing the global context
  const isMountedRef = useRef(false); // Ref to track if the component is mounted
  const isLoadingRef = useRef(false); // Ref to track the loading state
  const [baseQuotes, setBaseQuotes] = useState([]); // State for storing all fetched quotes
  const [viewQuotes, setViewQuotes] = useState([]); // State for storing quotes to display
  const [supplierSelectList, setSupplierSelectList] = useState([]); // State for storing the list of suppliers for filtering
  const [supplier, setSupplier] = useState(""); // State to store the selected supplier for filtering
  const [nextPageUrl, setNextPageUrl] = useState(null); // State to store the URL for the next page (for infinite scrolling)
  const [hasMore, setHasMore] = useState(true); // State to determine if more quotes can be fetched
  const [searchInput, setSearchInput] = useState(""); // State to store the current search input

  // Effect to extract and set the supplier select list from the fetched quotes
  useEffect(() => {
    if (!baseQuotes.length) return; // Exit if no quotes are fetched yet
    // Extract supplier list from the baseQuotes and update the state
    extractEntitiesSelectList(baseQuotes, setSupplierSelectList, "supplier");
  }, [baseQuotes]);

  // Effect to filter quotes based on the selected supplier
  useEffect(() => {
    if (!isMountedRef.current) return; // Exit if the component is not yet mounted
    if (!supplier) {
      setViewQuotes([]); // Reset the viewQuotes if no supplier is selected
    } else {
      // Filter the baseQuotes based on the selected supplier and update viewQuotes
      filterObjectsByEntity(supplier, baseQuotes, setViewQuotes, "supplier");
    }
  }, [supplier]);

  // Function to fetch quotes from the server
  const fetchQuotes = ({ searchValue = "", nextPage = null } = {}) => {
    isLoadingRef.current = true; // Set loading state to true
    // Fetch quotes with the given search value and next page URL
    getQuotes(token, setBaseQuotes, {
      searchInput: searchValue,
      nextPage: nextPage,
    }).then((response) => {
      if (response && response.success) {
        if (response.reachedEnd) {
          // If the end of the list is reached, update state to stop further fetching
          setNextPageUrl(null);
          setHasMore(false);
        } else {
          // Otherwise, update the nextPageUrl for the next fetch call
          setNextPageUrl(response.nextPage);
          setHasMore(true);
        }
      } else {
        // Show error toast if the fetch call fails
        showToast(
          "An unexpected error occurred. Please try again",
          "danger",
          "top-center",
        );
      }
      isLoadingRef.current = false; // Reset loading state
    });
  };

  // Effect to fetch quotes based on search input
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true; // Set the mounted ref to true on initial render
      return;
    }
    // Fetch quotes with the current search input
    fetchQuotes({ searchValue: searchInput, nextPage: null });
  }, [searchInput]);

  // Debounced search input handler
  const handleSearchInput = useCallback(
    debounce((value) => {
      setSearchInput(value); // Update the search input state
    }, 500),
    [],
  );

  // Handler for keydown event in the search input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchInput(event.target.value); // Set search input if Enter key is pressed
    }
  };

  // Render a loading spinner while the quotes are being fetched
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
      {/* Container for the top control elements like add quote, search bar, and supplier filter */}
      <Container className="my-3">
        {/* Row for aligning controls */}
        <Row className="align-items-center justify-content-md-evenly">
          {/* Column for the QuoteModal trigger button */}
          <Col md="auto" className="m">
            <QuoteModal onSuccessfulSubmit={fetchQuotes} />
          </Col>

          {/* Column for the search input field */}
          <Col xs={5} className="ms-2">
            <InputGroup>
              <InputGroup.Text id="basic-addon1">
                <SearchIcon />
              </InputGroup.Text>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Free Search"
                aria-label="Search"
                aria-describedby="basic-addon1"
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
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

      {/* InfiniteScroll component for loading and displaying quotes */}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
          fetchQuotes({
            searchValue: searchInput,
            nextPage: nextPageUrl,
          });
        }}
        hasMore={hasMore}
        loader={<Spinner className="loader" key={0} /* ... */ />}
      >
        {/* QuoteTable component to display the list of quotes */}
        <QuoteTable
          quoteList={viewQuotes.length ? viewQuotes : baseQuotes}
          handleEdit={fetchQuotes}
        />
      </InfiniteScroll>
    </div>
  );
};
export default QuotesPage;
