/**
 * API Client - Handles all backend API calls
 * Provides a centralized interface for communicating with the Express backend
 */

// Use relative URL to leverage Vite's proxy in development
// In production, set VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(
        response.ok
          ? 'Server returned non-JSON response'
          : `Server error (${response.status}): ${text.slice(0, 100)}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Provide a clearer message for network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('API Error: Cannot reach the backend server');
      throw new Error('Cannot connect to server. Please check that the backend is running.');
    }
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// CHAT API
// ============================================

export const chatAPI = {
  /**
   * Create a new chat session
   */
  createSession: async (userName = 'Anonymous') => {
    return fetchAPI('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });
  },

  /**
   * Get session history
   */
  getSession: async (sessionId) => {
    return fetchAPI(`/chat/sessions/${sessionId}`);
  },

  /**
   * Send a message in a session
   */
  sendMessage: async (sessionId, message) => {
    return fetchAPI(`/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * List recent sessions
   */
  listSessions: async (limit = 20) => {
    return fetchAPI(`/chat/sessions?limit=${limit}`);
  },
};

// ============================================
// FORUM API
// ============================================

export const forumAPI = {
  /**
   * Create a new question
   */
  createQuestion: async (userName, title, body) => {
    return fetchAPI('/forum/questions', {
      method: 'POST',
      body: JSON.stringify({ userName, title, body }),
    });
  },

  /**
   * List questions with pagination and sorting
   */
  listQuestions: async (sortBy = 'recent', limit = 20, offset = 0) => {
    return fetchAPI(`/forum/questions?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
  },

  /**
   * Get a specific question with replies
   */
  getQuestion: async (id) => {
    return fetchAPI(`/forum/questions/${id}`);
  },

  /**
   * Add a reply to a question or another reply
   */
  addReply: async (questionId, userName, body, parentReplyId = null) => {
    return fetchAPI(`/forum/questions/${questionId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ userName, body, parentReplyId }),
    });
  },

  /**
   * Upvote a question
   */
  upvoteQuestion: async (id, sessionId) => {
    return fetchAPI(`/forum/questions/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  /**
   * Remove upvote from a question
   */
  removeUpvoteQuestion: async (id, sessionId) => {
    return fetchAPI(`/forum/questions/${id}/upvote`, {
      method: 'DELETE',
      body: JSON.stringify({ sessionId }),
    });
  },

  /**
   * Upvote a reply
   */
  upvoteReply: async (id, sessionId) => {
    return fetchAPI(`/forum/replies/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },
};

// ============================================
// ROUTING/ESCALATION API
// ============================================

export const routingAPI = {
  /**
   * Manually escalate a question
   */
  escalateQuestion: async (data) => {
    return fetchAPI('/routing/escalate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List escalated questions
   */
  listEscalated: async (status = null, limit = 50, offset = 0) => {
    const statusParam = status ? `status=${status}&` : '';
    return fetchAPI(`/routing/escalated?${statusParam}limit=${limit}&offset=${offset}`);
  },

  /**
   * Get a specific escalated question
   */
  getEscalated: async (id) => {
    return fetchAPI(`/routing/escalated/${id}`);
  },

  /**
   * Update escalation status
   */
  updateEscalated: async (id, updates) => {
    return fetchAPI(`/routing/escalated/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Get escalation analytics
   */
  getAnalytics: async () => {
    return fetchAPI('/routing/analytics');
  },
};

export default {
  chatAPI,
  forumAPI,
  routingAPI,
};
