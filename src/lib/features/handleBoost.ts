import { loadStripe } from '@stripe/stripe-js';
import { LeaderboardEntry } from '../song';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const showNotification = (message: string, styleClass: string) => {
  alert(message);
};
export const handleBoost = async (
  boostAmount: number,
  entry: LeaderboardEntry,
  userId: string,
  organizationId: string
) => {
  const stripe = await stripePromise;
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: boostAmount,
      songId: entry.song.id,
      userId,
      organizationId,
    }),
  });

  const data = await res.json();

  if (data?.url) {
    window.location.href = data.url;
  } else {
    alert('Payment initiation failed.');
  }
};
