import React from "react";
import Pagination from "react-bootstrap/Pagination";

/**
 * A PaginatorComponent using React-Bootstrap's `Pagination` component.
 *
 * PaginatorComponent is a pagination component that handles page changes and enables users to navigate between pages.
 * It takes as props the `currentPage`, `totalPages`, and `onPageChange`.
 *
 * @component
 *
 * @prop {number} currentPage - The current active page.
 * @prop {number} totalPages - The total number of pages available.
 * @prop {Function} onPageChange - A callback function that handles the change of page when a new page is clicked.
 *
 * @example
 *
 * let currentPage = 3;
 * const totalPages = 10;

 * function onPageChange(newPage) {
 *   currentPage = newPage;
 * }
 *
 * return (
 *   <PaginatorComponent
 *     currentPage={currentPage}
 *     totalPages={totalPages}
 *     onPageChange={onPageChange}
 *   />
 * );
 *
 */
const PaginatorComponent = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    // Allow page change if the new page is within the valid range
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <Pagination>
      {/* "First" page button */}
      <Pagination.First
        onClick={() => handlePageChange(1)} // Go to first page when clicked
        disabled={currentPage === 1} // Disabled when current page is the first page
      />
      {/* "Previous" page button */}
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)} // Go to previous page when clicked
        disabled={currentPage === 1} // Disabled when current page is the first page
      />
      {/* First page item, hidden when current page is the first page */}
      {currentPage !== 1 && (
        <Pagination.Item
          onClick={() => handlePageChange(1)}
          active={currentPage === 1}
        >
          {1}
        </Pagination.Item>
      )}
      {/* Ellipsis item for hiding pages, shown when there are skipped pages on the left */}
      {currentPage > 2 && <Pagination.Ellipsis />}
      {/* Left neighbor page of current page: shown when there are pages skipped on the left */}
      {currentPage > 2 && <Pagination.Item>{currentPage - 1}</Pagination.Item>}
      {/* Current page item, always shown */}
      <Pagination.Item active={currentPage}>{currentPage}</Pagination.Item>
      {/* Right neighbor page of current page: shown when there are page/s skipped on the right */}
      {currentPage < totalPages - 1 && (
        <Pagination.Item>{currentPage + 1}</Pagination.Item>
      )}
      {/* Ellipsis item for hiding pages, shown when there are skipped pages on the right */}
      {currentPage < totalPages - 1 && <Pagination.Ellipsis />}
      {/* Last page item, hidden when current page is the last page */}
      {currentPage !== totalPages && (
        <Pagination.Item
          onClick={() => handlePageChange(totalPages)}
          active={currentPage === totalPages}
        >
          {totalPages}
        </Pagination.Item>
      )}
      {/* "Next" page button */}
      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages} // Disabled when current page is the last page
      />
      {/* "Last" page button*/}
      <Pagination.Last
        onClick={() => handlePageChange(totalPages)} // Go to last page when clicked
        disabled={currentPage === totalPages} // Disabled when current page is the last page
      />
    </Pagination>
  );
};

export default PaginatorComponent;
