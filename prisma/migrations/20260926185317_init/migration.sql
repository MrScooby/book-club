-- CreateEnum
CREATE TYPE "Person" AS ENUM ('SCOOBY', 'MINIS', 'BARTEK');

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "url" TEXT,
    "pages" INTEGER,
    "coverUrl" TEXT,
    "lcId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "proposedBy" "Person" NOT NULL,
    "vetoed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearBook" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "month" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YearBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Read" (
    "yearBookId" TEXT NOT NULL,
    "person" "Person" NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Read_pkey" PRIMARY KEY ("yearBookId","person")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_lcId_key" ON "Book"("lcId");

-- CreateIndex
CREATE INDEX "Suggestion_year_idx" ON "Suggestion"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Suggestion_year_bookId_key" ON "Suggestion"("year", "bookId");

-- CreateIndex
CREATE INDEX "YearBook_year_idx" ON "YearBook"("year");

-- CreateIndex
CREATE UNIQUE INDEX "YearBook_year_bookId_key" ON "YearBook"("year", "bookId");

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearBook" ADD CONSTRAINT "YearBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Read" ADD CONSTRAINT "Read_yearBookId_fkey" FOREIGN KEY ("yearBookId") REFERENCES "YearBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
