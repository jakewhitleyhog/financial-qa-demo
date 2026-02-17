/**
 * useQuestions Hook
 * Manages forum questions state with pagination and sorting
 */

import { useState, useEffect, useCallback } from 'react';
import { forumAPI } from '../services/api';

export function useQuestions(sortBy = 'recent', limit = 20) {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load questions
   */
  const loadQuestions = useCallback(async (offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await forumAPI.listQuestions(sortBy, limit, offset);
      setQuestions(response.questions || []);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, limit]);

  /**
   * Refresh questions (reset to first page)
   */
  const refresh = useCallback(() => {
    loadQuestions(0);
  }, [loadQuestions]);

  /**
   * Load next page
   */
  const loadMore = useCallback(() => {
    if (pagination && pagination.hasMore) {
      loadQuestions(pagination.offset + pagination.limit);
    }
  }, [pagination, loadQuestions]);

  /**
   * Create a new question
   */
  const createQuestion = useCallback(async (userName, title, body) => {
    setError(null);

    try {
      const response = await forumAPI.createQuestion(userName, title, body);
      // Refresh questions list after creating
      await refresh();
      return response.question;
    } catch (err) {
      setError(err.message);
      console.error('Failed to create question:', err);
      throw err;
    }
  }, [refresh]);

  /**
   * Load questions on mount and when dependencies change
   */
  useEffect(() => {
    loadQuestions(0);
  }, [loadQuestions]);

  return {
    questions,
    setQuestions,
    pagination,
    loading,
    error,
    refresh,
    loadMore,
    createQuestion,
  };
}

export default useQuestions;
