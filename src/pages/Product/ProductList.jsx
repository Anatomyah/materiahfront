import React, { useContext, useEffect, useState } from "react";
import { getProducts } from "../../clients/product_client";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import CreateProductModal from "../../components/Product/CreateProductModal";
import TextField from "@mui/material/TextField";
import { getSupplierSelectList } from "../../clients/supplier_client";
import InfiniteScroll from "react-infinite-scroller";

const ProductList = ({ isShopView = false, isCatalogueView = false }) => {
  const nav = useNavigate();
  const { token, isSupplier } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [searchInput, setSearchInput] = useState();
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
    getProducts(token, setProducts, {
      searchInput: searchValue,
      supplierId: supplierId,
      supplierCatalogue: isCatalogueView,
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

  const goToProductDetails = (product) => {
    const state = { product };
    if (isShopView) {
      state.shopView = true;
    }
    nav(`/product-details/${product.id}`, { state });
  };

  return (
    <div>
      {!isShopView && (
        <div>
          <CreateProductModal onSuccessfulCreate={fetchProducts} />
        </div>
      )}
      <TextField
        id="outlined-helperText"
        label="Free text search"
        onChange={(e) => handleSearchInput(e.target.value)}
      />
      {!isSupplier && (
        <>
          <select
            value={supplier}
            onChange={(e) => {
              setNextPageUrl(null);
              setSupplier(e.target.value);
            }}
          >
            <option value="" disabled>
              --Select Supplier--
            </option>
            {supplierSelectList.map((choice, index) => (
              <option key={index} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
          <button onClick={() => setSupplier("")}>Reset Supplier</button>
        </>
      )}
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
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
        {!products.length && supplier
          ? `No products related to this supplier`
          : products.map((product) => (
              <div
                key={product.id}
                className="text-decoration-underline text-primary"
                style={{ cursor: "pointer", minHeight: 500, display: "block" }}
                onClick={() => goToProductDetails(product)}
              >
                {product.images.length > 0 && (
                  <img
                    src={product.images[0].image}
                    alt={`product-${product.cat_num}-image-${product.images[0].id}`}
                    width="200"
                  />
                )}
                <h1>{product.cat_num}</h1>
                <h1>{product.name}</h1>
              </div>
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
export default ProductList;
