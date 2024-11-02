-- CreateTable
CREATE TABLE "CallHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "company" TEXT,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "cost" REAL,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "endedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
