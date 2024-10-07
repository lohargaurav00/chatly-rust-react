-- Create the uuid-ossp extension if it does not exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "image" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "created_at" BIGINT NOT NULL DEFAULT EXTRACT(epoch FROM now()),
    "updated_at" BIGINT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");
