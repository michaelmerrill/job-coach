"use server";

import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type State = {
  message?: string;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    phone?: string[];
    city?: string[];
    state?: string[];
    zip?: string[];
  };
  data?: FormData;
};

const UserMetadata = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  phone: z.string().nonempty("Phone is required"),
  city: z.string().nonempty("City is required"),
  state: z.string().nonempty("State is required"),
  zip: z.string().nonempty("Zip is required"),
});

export async function updateUserMetadata(prevState: State, formData: FormData) {
  // Authenticate
  const user = await stackServerApp.getUser({ or: "redirect" });
  // Validate
  const result = UserMetadata.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Invalid form data",
      data: formData,
    };
  }

  // Update
  try {
    const { firstName, lastName, phone, city, state, zip } = result.data;
    await user.update({
      clientMetadata: {
        firstName,
        lastName,
        phone,
        city,
        state,
        zip,
      },
      clientReadOnlyMetadata: {
        onboarded: true,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to update user metadata",
      data: formData,
    };
  }

  revalidatePath("/chat");
  redirect("/chat");
}
