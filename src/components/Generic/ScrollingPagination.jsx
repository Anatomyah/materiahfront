import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";

const ScrollingPagination = ({ fetchItems, hasMore, children }) => {
  return (
    <div>
      <InfiniteScroll
        useWindow={true}
        pageStart={1}
        loadMore={fetchItems}
        hasMore={hasMore}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {children}
      </InfiniteScroll>
    </div>
  );
};
export default ScrollingPagination;
