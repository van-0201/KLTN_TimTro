import React from 'react';
import '../../styles/pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            endPage = Math.min(totalPages, 5);
        }
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`page-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="pagination-container">
            <button 
                className="page-btn nav-btn" 
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Trước
            </button>
            
            <div className="page-numbers">
                {currentPage > 3 && totalPages > 5 && (
                    <>
                        <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
                        <span className="page-ellipsis">...</span>
                    </>
                )}
                
                {renderPageNumbers()}
                
                {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                        <span className="page-ellipsis">...</span>
                        <button className="page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                    </>
                )}
            </div>

            <button 
                className="page-btn nav-btn" 
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Sau
            </button>
        </div>
    );
};

export default Pagination;
