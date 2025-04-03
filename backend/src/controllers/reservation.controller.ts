import prisma from "../config/prisma";
import catchAsync from "../utils/catchAsync";
import {
  createReservationSchema,
  querySchema,
} from "../schemas/reservationSchema";
import AppError from "../utils/appError";
import { differenceInDays } from "../utils/date";

export const getAllReservations = catchAsync(async (req, res, next) => {
  const { listingId, userId, authorId } = querySchema.parse(req.query);

  const query = {
    ...(listingId && { listingId }),
    ...(userId && { userId }),
    ...(authorId && { authorId }),
  };

  const reservations = await prisma.reservation.findMany({
    where: query,
    include: {
      listing: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const safeReservations = reservations.map((reservation) => ({
    ...reservation,
    createdAt: reservation.createdAt.toISOString(),
    startDate: reservation.startDate.toISOString(),
    endDate: reservation.endDate.toISOString(),
  }));

  res.status(200).json({
    status: "success",
    data: {
      reservations: safeReservations,
    },
  });
});

export const createReservation = catchAsync(async (req, res, next) => {
  const { listingId, startDate, endDate } = createReservationSchema.parse(
    req.body
  );

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
  });

  if (!listing) {
    return next(new AppError("No listing found with that ID", 404));
  }

  // multiply number of days by listing price
  const diffDays = differenceInDays(endDate, startDate);
  const totalPrice = listing.price * diffDays;

  const updatedListing = await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      reservations: {
        create: {
          userId: req.user.id,
          startDate,
          endDate,
          totalPrice,
        },
      },
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      listing: updatedListing,
    },
  });
});

export const deleteReservation = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // check if reservation exists
  const reservationExists = await prisma.reservation.findUnique({
    where: {
      id,
    },
    include: {
      listing: true,
    },
  });

  if (!reservationExists) {
    return next(new AppError("No reservation found with that ID", 404));
  }

  if (
    reservationExists.userId !== req.user.id &&
    reservationExists.listing.userId !== req.user.id
  ) {
    return next(
      new AppError("You are not authorized to delete this reservation", 403)
    );
  }

  const reservation = await prisma.reservation.delete({
    where: {
      id,
      OR: [{ userId: req.user.id }, { listing: { userId: req.user.id } }],
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      reservation,
    },
  });
});
