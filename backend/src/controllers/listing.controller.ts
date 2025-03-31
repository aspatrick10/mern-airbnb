import prisma from "../config/prisma";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { createListingSchema, querySchema } from "../schemas/listing.schema";

export const getAllListings = catchAsync(async (req, res, next) => {
  // Parse query, will not throw error if invalid only set to undefined
  const {
    userId,
    category,
    roomCount,
    guestCount,
    bathroomCount,
    locationValue,
    startDate,
    endDate,
  } = querySchema.parse(req.query);

  // Build Prisma query
  const query: any = {
    ...(userId && { userId }),
    ...(category && { category }),
    ...(roomCount && { roomCount: { gte: roomCount } }),
    ...(guestCount && { guestCount: { gte: guestCount } }),
    ...(bathroomCount && { bathroomCount: { gte: bathroomCount } }),
    ...(locationValue && { locationValue }),
  };

  if (startDate && endDate && startDate < endDate) {
    query.NOT = {
      reservations: {
        some: {
          OR: [
            {
              endDate: { gte: startDate },
              startDate: { lte: startDate },
            },
            {
              startDate: { lte: endDate },
              endDate: { gte: endDate },
            },
          ],
        },
      },
    };
  }

  console.log(query);

  const listings = await prisma.listing.findMany({
    where: query,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      listings,
    },
  });
});

export const getListing = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const listing = await prisma.listing.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  if (!listing) {
    return next(new AppError("No listing found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      listing,
    },
  });
});

export const createListing = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    imageSrc,
    category,
    roomCount,
    guestCount,
    bathroomCount,
    location,
    price,
  } = createListingSchema.parse(req.body);

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      guestCount,
      bathroomCount,
      locationValue: location.value,
      price: parseInt(price, 10),
      userId: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      listing,
    },
  });
});

export const deleteListing = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // check if listing exists
  const listingExists = await prisma.listing.findUnique({
    where: {
      id,
    },
  });

  if (!listingExists) {
    return next(new AppError("No listing found with that ID", 404));
  }

  // check if listing belongs to user
  if (listingExists.userId !== req.user.id) {
    return next(
      new AppError("You are not authorized to delete this listing", 403)
    );
  }

  const listing = await prisma.listing.delete({
    where: {
      id,
      userId: req.user.id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      listing,
    },
  });
});
