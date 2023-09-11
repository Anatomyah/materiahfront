import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../../components/Generic/PaginatorComponent";
import { AppContext } from "../../App";
import { getQuotes } from "../../clients/quote_client";
import { useNavigate } from "react-router-dom";

const QuotesPage = () => {
  const { token } = useContext(AppContext);
  const nav = useNavigate();
  const [quotes, setQuotes] = useState();
  const [errorMessages, setErrorMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getQuotes(token, setQuotes, setTotalPages, currentPage).then((response) => {
      if (!response) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  }, [currentPage]);

  const goToQuoteDetails = (quote) => {
    console.log(quote);
    nav(`/quote-details/${quote.id}`, {
      state: { quote },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!quotes) {
    return "Loading...";
  }

  return (
    <div>
      {quotes.map((quote) => (
        <span
          key={quote.id}
          className="text-decoration-underline text-primary"
          style={{ cursor: "pointer" }}
          onClick={() => goToQuoteDetails(quote)}
        >
          {quote.id}
        </span>
      ))}
      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}

      <PaginatorComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
export default QuotesPage;
