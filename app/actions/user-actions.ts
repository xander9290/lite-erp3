"use server";

import { prisma } from "@/libs/prisma";
import { Partner, User } from "@prisma/client";

export interface UserWithPartner extends User {
  Partner?: Partner;
}
