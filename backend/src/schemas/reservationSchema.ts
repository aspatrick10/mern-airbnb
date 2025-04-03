import { z } from "zod";
import { ObjectIdSchema } from "./objectId.schema";

// none of these fields are required nor will they throw an error
export const querySchema = z.object({
  listingId: ObjectIdSchema.optional().catch(undefined),
  userId: ObjectIdSchema.optional().catch(undefined),
  authorId: ObjectIdSchema.optional().catch(undefined),
});

export const createReservationSchema = z
  .object({
    listingId: ObjectIdSchema,
    startDate: z.coerce.date(),
    // endate must be after startdate
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
