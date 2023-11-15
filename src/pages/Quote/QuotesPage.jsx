import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App";
import { getQuotes } from "../../clients/quote_client";
import QuoteModal from "../../components/Quote/QuoteModal";
import InfiniteScroll from "react-infinite-scroller";
import {
  extractEntitiesSelectList,
  filterObjectsByEntity,
} from "../../config_and_helpers/helpers";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import SearchIcon from "@mui/icons-material/Search";
import Form from "react-bootstrap/Form";
import RefreshIcon from "@mui/icons-material/Refresh";
import Container from "react-bootstrap/Container";
import QuoteTable from "../../components/Quote/QuoteTable";

const QuotesPage = () => {
  const { token } = useContext(AppContext);
  const isMountedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const [baseQuotes, setBaseQuotes] = useState([]);
  const [viewQuotes, setViewQuotes] = useState([]);
  const [supplierSelectList, setSupplierSelectList] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    console.log(baseQuotes);
  }, [baseQuotes]);

  useEffect(() => {
    console.log(supplierSelectList);
  }, [supplierSelectList]);

  useEffect(() => {
    if (!baseQuotes.length) return;
    if (baseQuotes) {
      extractEntitiesSelectList(baseQuotes, setSupplierSelectList, "supplier");
    }
  }, [baseQuotes]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!supplier) {
      setViewQuotes([]);
    }

    filterObjectsByEntity(supplier, baseQuotes, setViewQuotes, "supplier");
  }, [supplier]);

  const fetchQuotes = ({ searchValue = "", nextPage = null } = {}) => {
    isLoadingRef.current = true;
    getQuotes(token, setBaseQuotes, {
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
        setErrorMessages((prevState) => [...prevState, response]);
      }
      isLoadingRef.current = false;
    });
  };

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    fetchQuotes({
      searchValue: searchInput,
      nextPage: null,
    });
  }, [searchInput]);

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);
    setNextPageUrl(null);
    setTypingTimeout(newTimeout);
  };

  return (
    <div>
      <Container className="my-3">
        <Row className="align-items-center justify-content-md-evenly">
          <Col md="auto" className="m">
            <QuoteModal onSuccessfulSubmit={fetchQuotes} />
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
          fetchQuotes({
            searchValue: searchInput,
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
        <QuoteTable
          quoteList={viewQuotes.length ? viewQuotes : baseQuotes}
          handleEdit={fetchQuotes}
        />
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
export default QuotesPage;
