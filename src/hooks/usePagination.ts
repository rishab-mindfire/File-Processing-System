/**
 * usePagination Hook
 *
 * Provides client-side pagination for any array of data.
 *
 * @template T - Type of items in the data array
 *
 * @param data - Full dataset to paginate
 * @param itemsPerPage - Number of items per page (default: 5)
 *
 * @returns Pagination state and helpers:
 * - currentData: items for current page
 * - currentPage: active page number
 * - totalPages: total number of pages
 * - nextPage: go to next page
 * - prevPage: go to previous page
 * - goToPage: jump to specific page
 * - hasNextPage: whether next page exists
 * - hasPrevPage: whether previous page exists
 *
 * @example
 * const {
 *   currentData,
 *   currentPage,
 *   totalPages,
 *   nextPage,
 *   prevPage
 * } = usePagination(users, 10);
 */
import { useState, useEffect } from 'react';

export function usePagination<T>(data: T[], itemsPerPage: number = 5) {
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Calculate total number of pages
   * Ensures at least 1 page even if data is empty
   */
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  // Ensure currentPage stays valid when data changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [data.length, totalPages]);

  // Slice data for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  // Navigate to a specific page (clamped between 1 and totalPages)
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };
  // Go to next page
  const nextPage = () => goToPage(currentPage + 1);

  // Go to previous page
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
