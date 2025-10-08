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
  });

  return { user, isLoading, error, refetch };
};
