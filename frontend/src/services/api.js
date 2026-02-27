/**
 * API Client - Handles all backend API calls
 * Uses httpOnly cookies for authentication (sent automatically via credentials: 'include')
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Redirect to login on 401
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Session expired. Redirecting to login...');
    }

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
  createSession: async () => {
    return fetchAPI('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  getSession: async (sessionId) => {
    return fetchAPI(`/chat/sessions/${sessionId}`);
  },

  sendMessage: async (sessionId, message) => {
    return fetchAPI(`/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  listSessions: async (limit = 20) => {
    return fetchAPI(`/chat/sessions?limit=${limit}`);
  },
};

// ============================================
// FORUM API
// ============================================

export const forumAPI = {
  createQuestion: async (title, body) => {
    return fetchAPI('/forum/questions', {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    });
  },

  listQuestions: async (sortBy = 'recent', limit = 20, offset = 0) => {
    return fetchAPI(`/forum/questions?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
  },

  getQuestion: async (id) => {
    return fetchAPI(`/forum/questions/${id}`);
  },

  addReply: async (questionId, body, parentReplyId = null) => {
    return fetchAPI(`/forum/questions/${questionId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ body, parentReplyId }),
    });
  },

  upvoteQuestion: async (id) => {
    return fetchAPI(`/forum/questions/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  removeUpvoteQuestion: async (id) => {
    return fetchAPI(`/forum/questions/${id}/upvote`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },

  upvoteReply: async (id) => {
    return fetchAPI(`/forum/replies/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  removeUpvoteReply: async (id) => {
    return fetchAPI(`/forum/replies/${id}/upvote`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },

  // Admin: accept a reply as the answer
  acceptAnswer: async (questionId, replyId) => {
    return fetchAPI(`/forum/questions/${questionId}/accept/${replyId}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Admin: remove the accepted answer
  removeAcceptedAnswer: async (questionId) => {
    return fetchAPI(`/forum/questions/${questionId}/accept`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};

// ============================================
// ROUTING/ESCALATION API
// ============================================

export const routingAPI = {
  escalateQuestion: async (data) => {
    return fetchAPI('/routing/escalate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listEscalated: async (status = null, limit = 50, offset = 0) => {
    const statusParam = status ? `status=${status}&` : '';
    return fetchAPI(`/routing/escalated?${statusParam}limit=${limit}&offset=${offset}`);
  },

  getEscalated: async (id) => {
    return fetchAPI(`/routing/escalated/${id}`);
  },

  updateEscalated: async (id, updates) => {
    return fetchAPI(`/routing/escalated/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  getAnalytics: async () => {
    return fetchAPI('/routing/analytics');
  },
};

// ============================================
// DEAL DATA API
// ============================================

export const dealAPI = {
  getSummary: async () => {
    return fetchAPI('/deals/summary');
  },
};

export default {
  chatAPI,
  forumAPI,
  routingAPI,
  dealAPI,
};
