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

export const Register = () => {
  const registerFormSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
  });

  type RegisterFormSchemaType = z.infer<typeof registerFormSchema>;
  type RegisterUserResponse = {
    message: string;
  };

  const form = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const registerUser = async (
    data: RegisterFormSchemaType,
  ): Promise<RegisterUserResponse> => {
    const response = await axiosClient.post("/auth/register", data);
    return response.data as RegisterUserResponse;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => toast.success("User registered successfully"),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: RegisterFormSchemaType) => {
    mutate(data);
  };

  return (
    <div className="mt-2 flex w-full flex-col gap-4">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono">Name</FormLabel>
                <Input {...field} placeholder="John Doe" />
                <FormMessage />
              </FormItem>
            )}
          />
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
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
};
