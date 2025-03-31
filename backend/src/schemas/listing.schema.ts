import { z } from "zod";
import { ObjectIdSchema } from "./objectId.schema";

const CountrySchema = z.object({
  flag: z.string(),
  label: z.string(),
  latLng: z.array(z.number()),
  region: z.string(),
  value: z.string(),
});

export const createListingSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageSrc: z.string(),
  category: z.string(),
  roomCount: z.number(),
  guestCount: z.number(),
  bathroomCount: z.number(),
  location: CountrySchema,
  price: z.string(),
});

// none of these fields are required nor will they throw an error
export const querySchema = z.object({
  userId: ObjectIdSchema.optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  // value must be a positive int otherwise set to undefined
  roomCount: z.coerce.number().int().positive().optional().catch(undefined),
  guestCount: z.coerce.number().int().positive().optional().catch(undefined),
  bathroomCount: z.coerce.number().int().positive().optional().catch(undefined),
  locationValue: z.string().optional().catch(undefined),
  // value must be a valid ISO 8601 date otherwise set to undefined
  startDate: z.string().datetime().optional().catch(undefined),
  endDate: z.string().datetime().optional().catch(undefined),
});
