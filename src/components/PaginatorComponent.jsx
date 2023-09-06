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
      <Pagination.First
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      />
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      {currentPage !== 1 && (
        <Pagination.Item
          onClick={() => handlePageChange(1)}
          active={currentPage === 1}
        >
          {1}
        </Pagination.Item>
      )}

      {currentPage > 2 && <Pagination.Ellipsis />}

      {currentPage > 2 && <Pagination.Item>{currentPage - 1}</Pagination.Item>}

      <Pagination.Item active={currentPage}>{currentPage}</Pagination.Item>

      {currentPage < totalPages - 1 && (
        <Pagination.Item>{currentPage + 1}</Pagination.Item>
      )}

      {currentPage < totalPages - 1 && <Pagination.Ellipsis />}
      {currentPage !== totalPages && (
        <Pagination.Item
          onClick={() => handlePageChange(totalPages)}
          active={currentPage === totalPages}
        >
          {totalPages}
        </Pagination.Item>
      )}
      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <Pagination.Last
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
};

export default PaginatorComponent;
