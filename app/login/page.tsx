"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";


import {
  Button,
  Card,
  CardHeader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  useToast,
} from "@/components/index";

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});

const page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        ...data,
        callbackUrl: "/login",
      });

      if (!res) return;

      if (res.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully."
        });
        router.push("/");
      }

      if (res.error) {
        toast({
          title: "Error",
          description: res.error,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        
      });
    }
  };

  return (
    <main className=" flex h-full w-full justify-center items-center p-2">
      <Card className="flex flex-col gap-2 w-full md:w-[500px] px-6">
        <CardHeader className="text-center">Login</CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      inputMode="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Login</Button>
          </form>
        </Form>

        <p className="w-full text-right text-sm pb-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
};

export default page;
