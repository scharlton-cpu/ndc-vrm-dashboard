"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export async function loginAction(values: { email: string; password: string }) {
  try {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (!result || result.error) {
      return { error: "Invalid email or password." };
    }
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}
