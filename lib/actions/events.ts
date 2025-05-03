"use server";

import { prisma } from "../db";

export const getEvents = async (masjidId: string) => {
  const events = await prisma.event.findMany({
    where: {
      masjidId,
    },
    orderBy: {
      date: "asc",
    },
    include: {
      masjid: true,
    },
  });
  return events || [];
};

type CreateEventData = {
  title: string;
  date: Date;
  timeStart: Date;
  timeEnd: Date;
  location: string;
  description: string;
  type: string;
  tagColor: string;
  masjidId: string;
};

export const createEvent = async (event: CreateEventData) => {
  const newEvent = await prisma.event.create({
    data: {
      title: event.title,
      date: event.date,
      timeStart: event.timeStart,
      timeEnd: event.timeEnd,
      location: event.location,
      description: event.description,
      type: event.type,
      tagColor: event.tagColor,
      masjidId: event.masjidId,
    },
  });
  return newEvent;
};

export const getEventsById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });
  return event;
};

export const updateEvent = async (id: string, event: Partial<CreateEventData>) => {
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title: event.title,
      date: event.date,
      timeStart: event.timeStart,
      timeEnd: event.timeEnd,
      location: event.location,
      description: event.description,
      type: event.type,
      tagColor: event.tagColor,
    },
  });
  return updatedEvent;
};

export const deleteEvent = async (id: string) => {
  await prisma.event.delete({
    where: { id },
  });
  return { success: true };
};
