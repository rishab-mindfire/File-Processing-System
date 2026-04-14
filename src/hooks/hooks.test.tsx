import { describe, it, expect } from 'vitest';
import { formatBytes, delay, validateFiles } from './customeHooks';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('Utility Hooks', () => {
  // --- Test formatBytes ---
  describe('formatBytes', () => {
    it('should return "0 Bytes" when input is 0', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format KB, MB, and GB correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle decimals correctly', () => {
      expect(formatBytes(1500)).toBe('1.46 KB');
    });
  });

  // --- Test delay ---
  describe('delay', () => {
    it('should wait for the specified amount of time', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  // --- Test validateFiles ---
  describe('validateFiles', () => {
    // mock file creation for given size
    const createMockFile = (name: string, sizeInMB: number) => {
      const file = new File([''], name);
      Object.defineProperty(file, 'size', { value: sizeInMB * 1024 * 1024 });
      return file;
    };

    it('should reject files over the size limit', () => {
      // file of size 10MB
      const bigFile = createMockFile('10mbFile.zip', 10);
      const { validFiles, errors } = validateFiles([bigFile], 5);

      expect(validFiles).toHaveLength(0);
      expect(errors).toContain('10mbFile.zip is too large (max 5MB)');
    });

    it('should sort mixed files correctly', () => {
      const smallFile = createMockFile('1mbFile.txt', 1);
      const bigFile = createMockFile('10mbFile.zip', 10);

      const { validFiles, errors } = validateFiles([smallFile, bigFile], 5);

      expect(validFiles).toHaveLength(1);
      expect(errors).toHaveLength(1);
      expect(validFiles[0].name).toBe('1mbFile.txt');
    });
  });

  describe('usePagination Hook', () => {
    const mockData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 10 items

    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePagination(mockData, 3));

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(4); // 10 / 3 = 3.33 -> 4 pages
      expect(result.current.currentData).toEqual([1, 2, 3]);
      expect(result.current.hasPrevPage).toBe(false);
      expect(result.current.hasNextPage).toBe(true);
    });
    //next page check result
    it('should navigate to the next page', () => {
      const { result } = renderHook(() => usePagination(mockData, 5));

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.currentData).toEqual([6, 7, 8, 9, 10]);
      expect(result.current.hasNextPage).toBe(false);
    });
    //go to page 3
    it('should navigate to a specific page via goToPage', () => {
      const { result } = renderHook(() => usePagination(mockData, 2));

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
      expect(result.current.currentData).toEqual([5, 6]);
    });
    //current page 1 not -ve
    it('should not navigate below page 1', () => {
      const { result } = renderHook(() => usePagination(mockData, 5));

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.currentPage).toBe(1);
    });
    //if go to beyond page current page will be same
    it('should not navigate beyond the total pages', () => {
      const { result } = renderHook(() => usePagination(mockData, 5));

      act(() => {
        result.current.goToPage(10);
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should return at least 1 total page even with empty data', () => {
      const { result } = renderHook(() => usePagination([], 5));

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentData).toEqual([]);
    });
  });
});
