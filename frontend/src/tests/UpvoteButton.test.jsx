import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpvoteButton } from '../components/forum/UpvoteButton';

describe('UpvoteButton', () => {
  it('renders the upvote count', () => {
    render(<UpvoteButton upvotes={7} isUpvoted={false} onUpvote={vi.fn()} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onUpvote when clicked and not upvoted', async () => {
    const onUpvote = vi.fn().mockResolvedValue(undefined);
    render(<UpvoteButton upvotes={0} isUpvoted={false} onUpvote={onUpvote} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onUpvote).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveUpvote when clicked and already upvoted', async () => {
    const onRemoveUpvote = vi.fn().mockResolvedValue(undefined);
    render(
      <UpvoteButton
        upvotes={3}
        isUpvoted={true}
        onUpvote={vi.fn()}
        onRemoveUpvote={onRemoveUpvote}
      />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onRemoveUpvote).toHaveBeenCalledTimes(1);
  });

  it('button is disabled while async handler is in-flight', async () => {
    let resolveUpvote;
    const onUpvote = vi.fn().mockReturnValue(new Promise(r => { resolveUpvote = r; }));

    render(<UpvoteButton upvotes={0} isUpvoted={false} onUpvote={onUpvote} />);
    const btn = screen.getByRole('button');

    // fireEvent is synchronous and auto-wrapped in act — triggers setIsLoading(true)
    fireEvent.click(btn);

    // isLoading is now true → button disabled
    expect(btn).toBeDisabled();

    // Resolve and confirm it re-enables
    await act(async () => { resolveUpvote(); });
    expect(btn).not.toBeDisabled();
  });

  it('applies text-primary class when isUpvoted is true', () => {
    const { container } = render(
      <UpvoteButton upvotes={2} isUpvoted={true} onUpvote={vi.fn()} onRemoveUpvote={vi.fn()} />
    );
    // The animated number span gets text-primary when upvoted
    const primaryEl = container.querySelector('.text-primary');
    expect(primaryEl).toBeInTheDocument();
  });
});
