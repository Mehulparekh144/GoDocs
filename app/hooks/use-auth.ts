import { axiosClient } from "@/lib/axios-client";
import { useQuery } from "@tanstack/react-query";

export type User = {
  id: string;
  name: string;
  email: string;
};

export const useAuth = () => {
  const getUser = async () => {
    const response = await axiosClient.get("/user/me");
    return response.data as User;
  };

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5, // 5 minutes, avoids refetching often
    gcTime: 1000 * 60 * 10, // keeps it in cache even longer
    refetchOnWindowFocus: false, // no refetch when switching tabs
    refetchOnMount: false, // won't refetch every time component mounts
  });

  return { user, isLoading, error, refetch };
};
