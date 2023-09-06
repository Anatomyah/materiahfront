import React from "react";
import Pagination from "react-bootstrap/Pagination";

const PaginatorComponent = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  return (
    <Pagination>
      <Pagination.First onClick={() => handlePageChange(1)} />
      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
      <Pagination.Item
        onClick={() => handlePageChange(1)}
        active={currentPage === 1}
      >
        {1}
      </Pagination.Item>

      <Pagination.Ellipsis />

      <Pagination.Item>{10}</Pagination.Item>

      <Pagination.Ellipsis />
      <Pagination.Item
        onClick={() => handlePageChange(totalPages)}
        active={currentPage === totalPages}
      >
        {totalPages}
      </Pagination.Item>
      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
      <Pagination.Last onClick={() => handlePageChange(totalPages)} />
    </Pagination>
  );
};

export default PaginatorComponent;
