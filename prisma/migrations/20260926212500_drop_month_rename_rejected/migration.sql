-- DropColumn
ALTER TABLE "YearBook" DROP COLUMN "month";

-- RenameColumn
ALTER TABLE "Suggestion" RENAME COLUMN "vetoed" TO "rejected";
