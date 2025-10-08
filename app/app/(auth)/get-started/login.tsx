"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { axiosClient } from "@/lib/axios-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export const Login = () => {
  const router = useRouter();
  const loginFormSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
  });

  type LoginFormSchemaType = z.infer<typeof loginFormSchema>;
  type LoginUserResponse = {
    message: string;
  };

  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const loginUser = async (
    data: LoginFormSchemaType,
  ): Promise<LoginUserResponse> => {
    const response = await axiosClient.post("/auth/login", data);
    return response.data as LoginUserResponse;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("User logged in successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: LoginFormSchemaType) => {
    mutate(data);
  };

  return (
    <div className="mt-2 flex w-full flex-col gap-4">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono">Email</FormLabel>
                <Input {...field} placeholder="john@doe.com" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono">Password</FormLabel>
                <Input {...field} type="password" placeholder="********" />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
};
