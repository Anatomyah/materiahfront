import React, { useContext, useEffect, useState } from "react";
import { getProducts } from "../../clients/product_client";
import { AppContext } from "../../App";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { useNavigate } from "react-router-dom";
import CreateProductModal from "../../components/Product/CreateProductModal";
import TextField from "@mui/material/TextField";
import { getSupplierSelectList } from "../../clients/supplier_client";
import ScrollingPagination from "../../components/Generic/ScrollingPagination";

const ProductList = ({ isShopView = false, isCatalogueView = false }) => {
  const nav = useNavigate();
  const { token } = useContext(AppContext);
  const [productsList, setProductsList] = useState(null);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
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

  const fetchProducts = ({ searchValue = "", supplierId = "" } = {}) => {
    getProducts(token, setProductsList, setTotalPages, currentPage, {
      searchInput: searchValue,
      supplierId: supplierId,
      supplierCatalogue: isCatalogueView,
    }).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });

    if (currentPage >= totalPages) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  };

  useEffect(() => {
    fetchProducts({
      supplierId: supplier,
      searchValue: searchInput,
      supplierCatalogue: isCatalogueView,
    });
  }, [currentPage, supplier, searchInput]);

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

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  if (!productsList) {
    return "Loading...";
  }

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
      <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
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
      {/*{!productsList.length*/}
      {/*  ? `No products related to this supplier`*/}
      {/*  : productsList.map((product) => (*/}
      {/*      <div*/}
      {/*        key={product.id}*/}
      {/*        className="text-decoration-underline text-primary"*/}
      {/*        style={{ cursor: "pointer" }}*/}
      {/*        onClick={() => goToProductDetails(product)}*/}
      {/*      >*/}
      {/*        {product.images.length > 0 && (*/}
      {/*          <img*/}
      {/*            src={product.images[0].image}*/}
      {/*            alt={`product-${product.cat_num}-image-${product.images[0].id}`}*/}
      {/*            width="200"*/}
      {/*          />*/}
      {/*        )}*/}
      {/*        <h1>{product.cat_num}</h1>*/}
      {/*        <h1>{product.name}</h1>*/}
      {/*      </div>*/}
      {/*    ))}*/}
      <ScrollingPagination fetchItems={fetchProducts} hasMore={hasMore}>
        {!productsList.length
          ? `No products related to this supplier`
          : productsList.map((product) => (
              <div
                key={product.id}
                className="text-decoration-underline text-primary"
                style={{ cursor: "pointer" }}
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
      </ScrollingPagination>
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}
      {/*<PaginatorComponent*/}
      {/*  currentPage={currentPage}*/}
      {/*  totalPages={totalPages}*/}
      {/*  onPageChange={handlePageChange}*/}
      {/*/>*/}
    </div>
  );
};
export default ProductList;
