-- Migrate SabiSafe from NEAR testnet to Aurora testnet (EVM).
-- The database contained no user, transaction, contact, or receiving rows when
-- this ran, so the enum can be rebuilt safely. Amounts are stored as wei.

-- 1. Drop defaults that reference the old enum before rebuilding it.
ALTER TABLE "WalletConnection" ALTER COLUMN "network" DROP DEFAULT;
ALTER TABLE "TrustedContact" ALTER COLUMN "network" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "network" DROP DEFAULT;
ALTER TABLE "ReceivingRequest" ALTER COLUMN "network" DROP DEFAULT;

-- 2. Rename amount columns: yoctoNEAR (10^24) becomes wei (10^18).
ALTER TABLE "Transaction" RENAME COLUMN "amountYocto" TO "amountWei";
ALTER TABLE "ReceivingRequest" RENAME COLUMN "amountYocto" TO "amountWei";

-- 3. EVM transaction hashes are 0x + 64 hex characters (66 chars).
ALTER TABLE "Transaction" ALTER COLUMN "transactionHash" TYPE VARCHAR(80);

-- 4. Aurora's native asset is ETH.
ALTER TABLE "Transaction" ALTER COLUMN "asset" SET DEFAULT 'ETH';
ALTER TABLE "ReceivingRequest" ALTER COLUMN "asset" SET DEFAULT 'ETH';

-- 5. Rebuild the Network enum with Aurora values.
CREATE TYPE "Network_new" AS ENUM ('AURORA_TESTNET', 'AURORA_MAINNET');
ALTER TABLE "WalletConnection"
  ALTER COLUMN "network" TYPE "Network_new"
  USING ('AURORA_TESTNET'::text)::"Network_new";
ALTER TABLE "TrustedContact"
  ALTER COLUMN "network" TYPE "Network_new"
  USING ('AURORA_TESTNET'::text)::"Network_new";
ALTER TABLE "Transaction"
  ALTER COLUMN "network" TYPE "Network_new"
  USING ('AURORA_TESTNET'::text)::"Network_new";
ALTER TABLE "ReceivingRequest"
  ALTER COLUMN "network" TYPE "Network_new"
  USING ('AURORA_TESTNET'::text)::"Network_new";
DROP TYPE "Network";
ALTER TYPE "Network_new" RENAME TO "Network";

ALTER TABLE "WalletConnection" ALTER COLUMN "network" SET DEFAULT 'AURORA_TESTNET';
ALTER TABLE "TrustedContact" ALTER COLUMN "network" SET DEFAULT 'AURORA_TESTNET';
ALTER TABLE "Transaction" ALTER COLUMN "network" SET DEFAULT 'AURORA_TESTNET';
ALTER TABLE "ReceivingRequest" ALTER COLUMN "network" SET DEFAULT 'AURORA_TESTNET';
