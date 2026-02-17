/**
 * ReplyThread Component
 * Displays a threaded list of replies with nested responses
 */

import { useState } from 'react';
import { ReplyForm } from './ReplyForm';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ArrowUp, MessageSquare, CheckCircle } from 'lucide-react';

export function ReplyThread({ replies, onAddReply, onUpvote, sessionId }) {
  const [replyingTo, setReplyingTo] = useState(null);
  const [upvotedReplies, setUpvotedReplies] = useState(new Set());

  // Build tree structure from flat list
  const buildTree = (replies) => {
    const map = {};
    const roots = [];

    replies.forEach(reply => {
      map[reply.id] = { ...reply, children: [] };
    });

    replies.forEach(reply => {
      if (reply.parentReplyId && map[reply.parentReplyId]) {
        map[reply.parentReplyId].children.push(map[reply.id]);
      } else {
        roots.push(map[reply.id]);
      }
    });

    return roots;
  };

  const handleUpvote = async (replyId) => {
    if (upvotedReplies.has(replyId)) return;

    try {
      await onUpvote(replyId);
      setUpvotedReplies(prev => new Set([...prev, replyId]));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleReply = async (parentReplyId, data) => {
    await onAddReply({ ...data, parentReplyId });
    setReplyingTo(null);
  };

  const ReplyItem = ({ reply, depth = 0 }) => {
    const isUpvoted = upvotedReplies.has(reply.id);

    return (
      <div
        className={`${
          depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''
        } py-3`}
      >
        <div className="flex gap-3">
          {/* Upvote button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleUpvote(reply.id)}
              disabled={isUpvoted}
              className={`p-1 rounded transition-colors ${
                isUpvoted
                  ? 'text-green-600 bg-green-50 cursor-default'
                  : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'
              }`}
              title={isUpvoted ? 'Already upvoted' : 'Upvote this reply'}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-gray-600">
              {reply.upvotes}
            </span>
          </div>

          {/* Reply content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {reply.userName}
              </span>
              {reply.isAcceptedAnswer && (
                <Badge variant="success" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepted Answer
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {new Date(reply.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
              {reply.body}
            </p>

            {/* Reply button */}
            <button
              onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
              className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Reply
            </button>

            {/* Reply form */}
            {replyingTo === reply.id && (
              <div className="mt-3">
                <ReplyForm
                  onSubmit={(data) => handleReply(reply.id, data)}
                  onCancel={() => setReplyingTo(null)}
                  placeholder={`Reply to ${reply.userName}...`}
                />
              </div>
            )}

            {/* Nested replies */}
            {reply.children && reply.children.length > 0 && (
              <div className="mt-2">
                {reply.children.map(child => (
                  <ReplyItem key={child.id} reply={child} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tree = buildTree(replies);

  return (
    <div className="space-y-2">
      {tree.map(reply => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}

      {tree.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No replies yet. Be the first to respond!
        </div>
      )}
    </div>
  );
}

export default ReplyThread;
