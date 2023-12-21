import React from "react";
import InfiniteScroll from "react-infinite-scroller";

/**
 * A ScrollingPagination Component using `react-infinite-scroller`.
 *
 * The ScrollingPagination component uses infinite scrolling to fetch and display a list of items. As the user scrolls through the existing list of items, this component fetches more items and adds them to the list.
 * It takes in three props: a function `fetchItems` for fetching more items, a boolean `hasMore` to indicate if there are more items to be fetched, and `children` which are the items to be displayed.
 *
 * @component
 *
 * @prop {Function} fetchItems - The function to fetch new items.
 * @prop {boolean} hasMore - Indicate if there are more items to be fetched.
 * @prop {React.ReactNode} children - The items to be displayed.
 *
 * @example
 *
 * const [items, setItems] = useState([]);
 * const [hasMore, setHasMore] = useState(true);
 *
 * function fetchItems() {
 *   // Your API call here
 * }
 *
 * return (
 *   <ScrollingPagination fetchItems={fetchItems} hasMore={hasMore}>
 *     {items.map(item => (
 *       <ItemComponent key={item.id} item={item} />
 *     ))}
 *   </ScrollingPagination>
 * );
 *
 * @returns {React.Node} - The ScrollingPagination component
 */
const ScrollingPagination = ({ fetchItems, hasMore, children }) => {
  return (
    <div>
      {/* InfiniteScroll component */}
      <InfiniteScroll
        // Scroll event Attach/Detach to/from the window
        useWindow={true}
        // The page that the scroll should start from
        pageStart={1}
        // Callback function that fetches more items
        loadMore={fetchItems}
        // Determines if there are more items to load
        hasMore={hasMore}
        // The loader to show during the fetching of items
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {/* The children items to populate in the InfiniteScroll */}
        {children}
      </InfiniteScroll>
    </div>
  );
};
export default ScrollingPagination;
