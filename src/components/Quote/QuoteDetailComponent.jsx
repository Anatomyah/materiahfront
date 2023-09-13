import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AppContext } from "../../App";
import { getQuoteDetails } from "../../clients/quote_client";

const QuoteDetailComponent = () => {
  const { token } = useContext(AppContext);
  const { id } = useParams();
  const location = useLocation();
  const [quote, setQuote] = useState(
    location.state ? location.state.quote : null,
  );
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (!quote) {
      getQuoteDetails(token, id, setQuote).then((response) => {
        if (response && !response.success) {
          setErrorMessages((prevState) => [...prevState, response]);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    console.log(quote);
  }, [quote]);

  if (!quote) {
    return "Quote details not available";
  }

  return (
    <div>
      <h1>{quote.id}</h1>
      <Link to={`/supplier-details/${quote.supplier.id}`}>
        {quote.supplier.name}
      </Link>
      {quote.items.map((item) => (
        <div key={item.product.id}>
          <h1>{item.product.cat_num}</h1>
          <p>{item.price}</p>
        </div>
      ))}
      <a href={quote.pdf} target="_blank" rel="noopener noreferrer">
        Quote PDF
      </a>
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
export default QuoteDetailComponent;
