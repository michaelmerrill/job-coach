"use client";

import { useActionState } from "react";
import { State, updateUserMetadata } from "@/actions/users";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: State = {
  errors: {},
  message: "",
  data: new FormData(),
};

export default function Form() {
  const [state, action, isPending] = useActionState(
    updateUserMetadata,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4">
      {/* First Name */}
      <div>
        <div className="grid gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            aria-describedby="firstNameError"
            defaultValue={(state.data?.get("firstName") as string) || ""}
            required
          />
        </div>
        <div id="firstNameError" aria-live="polite" aria-atomic="true">
          <p className="text-red-500 text-sm">{state.errors?.firstName?.[0]}</p>
        </div>
      </div>

      {/* Last Name */}
      <div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            aria-describedby="lastNameError"
            defaultValue={(state.data?.get("lastName") as string) || ""}
            required
          />
        </div>
        <div id="lastNameError" aria-live="polite" aria-atomic="true">
          <p className="text-red-500 text-sm">{state.errors?.lastName?.[0]}</p>
        </div>
      </div>

      {/* Phone */}
      <div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            aria-describedby="phoneError"
            defaultValue={(state.data?.get("phone") as string) || ""}
            required
          />
        </div>
        <div id="phoneError" aria-live="polite" aria-atomic="true">
          <p className="text-red-500 text-sm">{state.errors?.phone?.[0]}</p>
        </div>
      </div>

      {/* City */}
      <div>
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            type="text"
            id="city"
            name="city"
            autoComplete="address-level2"
            aria-describedby="cityError"
            defaultValue={(state.data?.get("city") as string) || ""}
            required
          />
        </div>
        <div id="cityError" aria-live="polite" aria-atomic="true">
          <p className="text-red-500 text-sm">{state.errors?.city?.[0]}</p>
        </div>
      </div>

      {/* State */}
      <div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input
            type="text"
            id="state"
            name="state"
            autoComplete="address-level1"
            aria-describedby="stateError"
            defaultValue={(state.data?.get("state") as string) || ""}
            required
          />
        </div>
        <div id="stateError" aria-live="polite" aria-atomic="true">
          <p className="text-red-500 text-sm">{state.errors?.state?.[0]}</p>
        </div>
      </div>

      {/* Zip */}
      <div>
        <div className="grid gap-2">
          <Label htmlFor="zip">Zip</Label>
          <Input
            type="text"
            id="zip"
            name="zip"
            autoComplete="postal-code"
            aria-describedby="zipError"
            defaultValue={(state.data?.get("zip") as string) || ""}
            required
          />
        </div>
        <div id="zipError" aria-live="polite" aria-atomic="true">
          <p className="text-red-500 text-sm">{state.errors?.zip?.[0]}</p>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Getting Started..." : "Get Started"}
      </Button>
    </form>
  );
}
