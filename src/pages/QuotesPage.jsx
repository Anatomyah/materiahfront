import React, { useContext, useEffect, useState } from "react";
import PaginatorComponent from "../components/PaginatorComponent";
import { AppContext } from "../App";
import { getQuotes } from "../client/quote_client";

const QuotesPage = () => {
  const { token } = useContext(AppContext);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!quotes) {
    return "Loading...";
  }

  return (
    <div>
      {quotes.map((quote) => (
        <li key={quote.id}>{quote.id}</li>
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
