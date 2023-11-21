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

const OrdersPage = () => {
  const { token } = useContext(AppContext);
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const [baseOrders, setBaseOrders] = useState([]);
  const [viewOrders, setViewOrders] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!baseOrders.length) return;
    if (baseOrders) {
      extractEntitiesSelectList(baseOrders, setSupplierSelectList, "supplier");
    }
  }, [baseOrders]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!supplier) {
      setViewOrders([]);
    }

    filterObjectsByEntity(supplier, baseOrders, setViewOrders, "supplier");
  }, [supplier]);

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
    fetchOrders({
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
            <OrderModal onSuccessfulSubmit={fetchOrders} />
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
            {supplierSelectList && (
              <InputGroup>
                <Form.Select
                  value={supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                  }}
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
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {
          if (isLoadingRef.current) return;
          fetchOrders({
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
        <OrderTable
          orderList={viewOrders.length ? viewOrders : baseOrders}
          handleEdit={fetchOrders}
        />
      </InfiniteScroll>
    </div>
  );
};
export default OrdersPage;
