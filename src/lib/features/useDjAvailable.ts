import { useState, useEffect } from "react";

export function useDjAvailability(orgId: string) {
  const [djAvailable, setDjAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    const fetchDJAvailability = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgId}`);
        const data = await res.json();
        setDjAvailable(data.djAvailable);
      } catch (err) {
        console.error("Failed to fetch DJ availability", err);
        setDjAvailable(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDJAvailability();
  }, [orgId]);

  return { djAvailable, loading };
}
