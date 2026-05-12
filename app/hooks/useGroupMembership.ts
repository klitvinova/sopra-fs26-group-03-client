"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";

interface UseGroupMembershipResult {
  group: Group | null;
  hasGroup: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useGroupMembership = (): UseGroupMembershipResult => {
  const apiService = useApi();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembership = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentGroup = await apiService.get<Group>("/groups/me");
      setGroup(currentGroup);
    } catch {
      setGroup(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    void fetchMembership();
  }, [fetchMembership]);

  const hasGroup = useMemo(() => {
    return group != null;
  }, [group]);

  return {
    group,
    hasGroup,
    isLoading,
    refetch: fetchMembership,
  };
};

