-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Repeat" AS ENUM ('day', 'week', 'month', 'none');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "repeat" "public"."Repeat",
    "dayRepeat" INTEGER,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "size" INTEGER,
    "description" VARCHAR(500),
    "exclusive" BOOLEAN DEFAULT false,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Scale" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "direction" TEXT NOT NULL,
    "band" TEXT,
    "projection" TEXT,
    "light" TEXT,
    "transmission" TEXT,
    "camera" TEXT,
    "live" TEXT,
    "sound" TEXT,
    "trainingSound" TEXT,
    "photography" TEXT,
    "stories" TEXT,
    "dynamic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Member" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "cep" TEXT,
    "motherName" TEXT,
    "fatherName" TEXT,
    "maritalStatus" TEXT,
    "hasChildren" BOOLEAN DEFAULT false,
    "childrenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MemberOnScale" (
    "memberId" INTEGER NOT NULL,
    "scaleId" TEXT NOT NULL,

    CONSTRAINT "MemberOnScale_pkey" PRIMARY KEY ("memberId","scaleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_cpf_key" ON "public"."Member"("cpf");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemberOnScale" ADD CONSTRAINT "MemberOnScale_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MemberOnScale" ADD CONSTRAINT "MemberOnScale_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "public"."Scale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
