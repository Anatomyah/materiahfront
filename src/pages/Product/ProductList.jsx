import React, { useContext, useEffect, useRef, useState } from "react";
import { getProducts } from "../../clients/product_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import ProductModal from "../../components/Product/ProductModal";
import { getSupplierSelectList } from "../../clients/supplier_client";
import InfiniteScroll from "react-infinite-scroller";
import ItemCard from "../../components/Generic/ItemCard";
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

const ProductList = ({ isShopView = false, isCatalogueView = false }) => {
  const nav = useNavigate();
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const { token, isSupplier } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    getSupplierSelectList(token, setSupplierSelectList).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, []);

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
      if (response && response.success) {
        if (response.reachedEnd) {
          setNextPageUrl(null);
          setHasMore(false);
        } else {
          setNextPageUrl(response.nextPage);
          setHasMore(true);
        }
      } else {
        setErrorMessages((prevState) => [...prevState, response]);
      }
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    console.log(supplierSelectList);
  }, [supplierSelectList]);

  useEffect(() => {
    console.log(supplier);
  }, [supplier]);

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

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);

    setTypingTimeout(newTimeout);
  };

  const goToProductDetails = (productId) => {
    const state = { shopView: false };
    if (isShopView) {
      state.shopView = true;
    }
    nav(`/product-details/${productId}`, { state });
  };

  return (
    <div>
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
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {!products.length ? (
          `No products related to this supplier`
        ) : !isCatalogueView && !isShopView ? (
          <ProductTable productList={products} handleEdit={fetchProducts} />
        ) : (
          <div className="d-flex flex-wrap flex-row justify-content-start bg-dark-subtle pt-2">
            {products.map((product) => (
              <div className="item-card" key={product.id}>
                <ItemCard
                  props={{
                    image: product?.images[0]?.image_url,
                    name: product.name,
                    catNum: product.cat_num,
                    supplier: product.supplier.name,
                    manufacturer: product.manufacturer.name,
                    category: product.category,
                    volume: product.volume,
                    imageClick: () => goToProductDetails(product.id),
                  }}
                />
              </div>
            ))}
          </div>
        )}
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
export default ProductList;
