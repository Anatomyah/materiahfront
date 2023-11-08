import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../../App";
import { getQuoteDetails } from "../../clients/quote_client";
import EditQuoteModal from "./EditQuoteModal";
import DeleteButton from "../Generic/DeleteButton";
import { deleteQuote } from "../../clients/quote_client";

const QuoteDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!quote) {
      fetchQuote();
    }
  }, [id, quote]);

  const fetchQuote = () => {
    getQuoteDetails(token, id, setQuote).then((response) => {
      if (response && !response.success) {
        setErrorMessages((prevState) => [...prevState, response]);
      }
    });
  };

  if (!quote) {
    return "Quote details not available";
  }

  return (
    <div>
      <h1>{quote.id}</h1>
      <h1>{quote.creation_date}</h1>
      <h1>Status: {quote.status}</h1>
      <Link to={`/supplier-details/${quote.supplier.id}`}>
        {quote.supplier.name}
      </Link>
      {quote.items.map((item) => (
        <div key={item.product.id}>
          <h1>{item.product.cat_num}</h1>
          <p>{item.price}</p>
        </div>
      ))}

      <a href={quote.quote_url} target="_blank" rel="noopener noreferrer">
        Quote PDF
      </a>

      <EditQuoteModal quoteObj={quote} onSuccessfulUpdate={fetchQuote} />

      {!errorMessages && (
        <ul>
          {errorMessages.map((error, id) => (
            <li key={id} className="text-danger fw-bold">
              {error}
            </li>
          ))}
        </ul>
      )}

      <DeleteButton
        objectType="quote"
        objectName={quote.id}
        objectId={quote.id}
        deleteFetchFunc={deleteQuote}
        returnLocation="quotes"
      />
    </div>
  );
};
export default QuoteDetailComponent;
