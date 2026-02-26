import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReplyThread } from '../components/forum/ReplyThread';

const baseReply = {
  id: 1,
  parentReplyId: null,
  userName: 'Alice',
  body: 'This is a test reply',
  upvotes: 3,
  isUpvoted: false,
  isAcceptedAnswer: false,
  createdAt: new Date().toISOString(),
};

describe('ReplyThread', () => {
  it('renders "No replies yet" when replies array is empty', () => {
    render(
      <ReplyThread
        replies={[]}
        onAddReply={vi.fn()}
        onUpvote={vi.fn()}
        onRemoveUpvote={vi.fn()}
      />
    );
    expect(screen.getByText(/no replies yet/i)).toBeInTheDocument();
  });

  it('renders reply body text and author name', () => {
    render(
      <ReplyThread
        replies={[baseReply]}
        onAddReply={vi.fn()}
        onUpvote={vi.fn()}
        onRemoveUpvote={vi.fn()}
      />
    );
    expect(screen.getByText('This is a test reply')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('calls onUpvote with reply id when clicking non-upvoted reply', async () => {
    const onUpvote = vi.fn().mockResolvedValue(undefined);
    render(
      <ReplyThread
        replies={[baseReply]}
        onAddReply={vi.fn()}
        onUpvote={onUpvote}
        onRemoveUpvote={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTitle('Upvote this reply'));
    expect(onUpvote).toHaveBeenCalledWith(1);
  });

  it('calls onRemoveUpvote with reply id when clicking already-upvoted reply', async () => {
    const onRemoveUpvote = vi.fn().mockResolvedValue(undefined);
    render(
      <ReplyThread
        replies={[{ ...baseReply, isUpvoted: true }]}
        onAddReply={vi.fn()}
        onUpvote={vi.fn()}
        onRemoveUpvote={onRemoveUpvote}
      />
    );
    await userEvent.click(screen.getByTitle('Remove upvote'));
    expect(onRemoveUpvote).toHaveBeenCalledWith(1);
  });

  it('does not throw when onUpvote prop is omitted', async () => {
    render(
      <ReplyThread
        replies={[baseReply]}
        onAddReply={vi.fn()}
        onRemoveUpvote={vi.fn()}
      />
    );
    // Clicking should silently call the default no-op, not throw
    await expect(
      userEvent.click(screen.getByTitle('Upvote this reply'))
    ).resolves.not.toThrow();
  });

  it('does not throw when onRemoveUpvote prop is omitted', async () => {
    render(
      <ReplyThread
        replies={[{ ...baseReply, isUpvoted: true }]}
        onAddReply={vi.fn()}
        onUpvote={vi.fn()}
      />
    );
    await expect(
      userEvent.click(screen.getByTitle('Remove upvote'))
    ).resolves.not.toThrow();
  });
});
