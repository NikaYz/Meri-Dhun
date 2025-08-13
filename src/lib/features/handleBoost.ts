// import { loadStripe } from '@stripe/stripe-js';
import { LeaderboardEntry } from '../song';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const handleBoost = async (
  boostAmount: number,
  entry: LeaderboardEntry,
  userId: string,
  organizationId: string
) => {
  // You were assigning 'stripe' a value and never using it.
  // The 'stripe' object is not needed for this function's logic,
  // so we can remove the variable declaration to fix the error.
  
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
// import { loadStripe } from '@stripe/stripe-js';
// import { LeaderboardEntry } from '../song';
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// export const handleBoost = async (
//   boostAmount: number,
//   entry: LeaderboardEntry,
//   userId: string,
//   organizationId: string
// ) => {
//   const stripe = await stripePromise;
//   const res = await fetch('/api/create-checkout-session', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       amount: boostAmount,
//       songId: entry.song.id,
//       userId,
//       organizationId,
//     }),
//   });

//   const data = await res.json();

//   if (data?.url) {
//     window.location.href = data.url;
//   } else {
//     alert('Payment initiation failed.');
//   }
// };
