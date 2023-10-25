import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { AppContext } from "../../App";
import { getQuotes } from "../../clients/quote_client";
import { useNavigate } from "react-router-dom";
import CreateQuoteModal from "../../components/Quote/CreateQuoteModal";
import TextField from "@mui/material/TextField";
import InfiniteScroll from "react-infinite-scroller";

const QuotesPage = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchQuotes = () => {
    getQuotes(token, setQuotes, nextPageUrl, searchInput).then((response) => {
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
    fetchQuotes();
  }, [searchInput]);

  const goToQuoteDetails = (quote) => {
    console.log(quote);
    nav(`/quote-details/${quote.id}`, {
      state: { quote },
    });
  };

  const handleSearchInput = (value) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setSearchInput(value);
    }, 2000);
    setNextPageUrl(null);
    setTypingTimeout(newTimeout);
  };

  if (!quotes.length) {
    return "Loading...";
  }

  return (
    <div>
      <CreateQuoteModal onSuccessfulCreate={fetchQuotes} />
      <TextField
        id="outlined-helperText"
        label="Free text search"
        onChange={(e) => handleSearchInput(e.target.value)}
      />
      <InfiniteScroll
        pageStart={0}
        loadMore={fetchQuotes}
        hasMore={hasMore}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {quotes.map((quote) => (
          <span
            key={quote.id}
            className="text-decoration-underline text-primary"
            style={{ cursor: "pointer", minHeight: 500, display: "block" }}
            onClick={() => goToQuoteDetails(quote)}
          >
            {quote.id}
          </span>
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
export default QuotesPage;
