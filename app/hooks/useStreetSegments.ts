import { useCallback, useEffect, useState } from "react";
import { StreetSegmentService } from "../services/api";
import { StreetSegment } from "../../types";

function useStreetSegments() {
  const [segments, setSegments] = useState<StreetSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await StreetSegmentService.getStreetSegments();
      setSegments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to fetch street segments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSegments = useCallback(() => {
    StreetSegmentService.clearCache();
    fetchSegments();
  }, [fetchSegments]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return {
    segments,
    loading,
    error,
    refreshSegments,
  };
}

export default useStreetSegments;