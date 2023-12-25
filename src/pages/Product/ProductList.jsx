import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getProducts } from "../../clients/product_client";
import { AppContext } from "../../App";
import ProductModal from "../../components/Product/ProductModal";
import { getSupplierSelectList } from "../../clients/supplier_client";
import InfiniteScroll from "react-infinite-scroller";
import ItemCard from "../../components/Product/ItemCard";
import "./ProductPageStyle.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import TextField from "@mui/material/TextField";
import ProductTable from "../../components/Product/ProductTable";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import SearchIcon from "@mui/icons-material/Search";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import SupplierSelect from "../../components/Generic/SupplierSelect";
import { Spinner } from "react-bootstrap";
import { showToast } from "../../config_and_helpers/helpers";
import debounce from "lodash/debounce";

/**
 * Represents a product list component, displaying products either in a table or card format.
 *
 * This component provides functionalities such as infinite scrolling, supplier filtering, and free text search.
 * It adapts its presentation based on the view context (shop, catalogue, or standard view) and allows
 * for the addition of new products and updating existing ones.
 *
 * @component
 * @param {Object} props
 * @param {boolean} [props.isShopView=false] - Determines if the component is used in a shop view.
 * @param {boolean} [props.isCatalogueView=false] - Determines if the component is used in a catalogue view.
 * @returns The ProductList component.
 *
 * Usage:
 * ```jsx
 * <ProductList
 *    isShopView={false}
 *    isCatalogueView={false}
 * />
 * ```
 */
const ProductList = ({ isShopView = false, isCatalogueView = false }) => {
  // State and context management.
  const { token, isSupplier } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const [products, setProducts] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // Fetching supplier select list on component mount.
  useEffect(() => {
    getSupplierSelectList(token, setSupplierSelectList);
  }, []);

  // Function to fetch products based on certain parameters.
  const fetchProducts = ({
    searchValue = "",
    supplierId = "",
    nextPage = null,
  } = {}) => {
    isLoadingRef.current = true;
    getProducts(token, setProducts, {
      searchInput: searchValue,
      supplierId: supplierId,
      supplierCatalogue: isCatalogueView,
      nextPage: nextPage,
    }).then((response) => {
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
          "danger",
          "top-center",
        );
      }
      isLoadingRef.current = false;
    });
  };

  // Fetch products whenever the supplier or search input changes.
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    fetchProducts({
      supplierId: supplier,
      searchValue: searchInput,
      supplierCatalogue: isCatalogueView,
      nextPage: null,
    });
  }, [supplier, searchInput]);

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
      {/* Container for search, filtering, and product addition UI */}
      <Container className="my-3">
        <Row className="align-items-center justify-content-md-evenly">
          {!isShopView && (
            <Col md="auto" className="m">
              <ProductModal onSuccessfulSubmit={fetchProducts} />
            </Col>
          )}
          <Col xs={5} className="ms-2">
            {isShopView || isCatalogueView ? (
              <TextField
                sx={{ width: 300 }}
                id="outlined-helperText"
                label="Free text search"
                onChange={(e) => handleSearchInput(e.target.value)}
              />
            ) : (
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
            )}
          </Col>
          <Col md="auto" sm>
            {!isSupplier &&
              (isShopView || isCatalogueView ? (
                <SupplierSelect
                  supplierList={supplierSelectList}
                  supplier={supplier}
                  handleChange={(e) => {
                    setNextPageUrl(null);
                    setSupplier(e.target.value);
                  }}
                  handleClick={() => setSupplier("")}
                />
              ) : (
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
              ))}
          </Col>
        </Row>
      </Container>
      {/* InfiniteScroll component for loading more products */}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
          fetchProducts({
            supplierId: supplier,
            searchValue: searchInput,
            supplierCatalogue: isCatalogueView,
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
        {/* Conditional rendering of ProductTable or ItemCard components based on view context */}
        {!products.length ? (
          <div>Nothing here...</div>
        ) : !isCatalogueView && !isShopView ? (
          <ProductTable productList={products} handleEdit={fetchProducts} />
        ) : (
          <div className="bg-dark-subtle">
            <div className="d-flex flex-wrap flex-row justify-content-start">
              {products.map((product) => (
                <div className="item-card" key={product.id}>
                  <ItemCard product={product} handleEdit={fetchProducts} />
                </div>
              ))}
            </div>
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};
export default ProductList;
