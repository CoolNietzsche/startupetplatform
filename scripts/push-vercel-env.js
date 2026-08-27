const { execSync } = require('child_process');

const envs = {
  DATABASE_URL: "postgresql://neondb_owner:npg_CwHW7iSd4nYB@ep-square-rice-am4n6lgl-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  DATABASE_URL_UNPOOLED: "postgresql://neondb_owner:npg_CwHW7iSd4nYB@ep-square-rice-am4n6lgl.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require",
  PGHOST: "ep-square-rice-am4n6lgl-pooler.c-5.us-east-1.aws.neon.tech",
  PGHOST_UNPOOLED: "ep-square-rice-am4n6lgl.c-5.us-east-1.aws.neon.tech",
  PGUSER: "neondb_owner",
  PGDATABASE: "neondb",
  PGPASSWORD: "npg_CwHW7iSd4nYB",
  POSTGRES_URL: "postgresql://neondb_owner:npg_CwHW7iSd4nYB@ep-square-rice-am4n6lgl-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  POSTGRES_URL_NON_POOLING: "postgresql://neondb_owner:npg_CwHW7iSd4nYB@ep-square-rice-am4n6lgl.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  POSTGRES_USER: "neondb_owner",
  POSTGRES_HOST: "ep-square-rice-am4n6lgl-pooler.c-5.us-east-1.aws.neon.tech",
  POSTGRES_PASSWORD: "npg_CwHW7iSd4nYB",
  POSTGRES_DATABASE: "neondb",
  POSTGRES_URL_NO_SSL: "postgresql://neondb_owner:npg_CwHW7iSd4nYB@ep-square-rice-am4n6lgl-pooler.c-5.us-east-1.aws.neon.tech/neondb",
  POSTGRES_PRISMA_URL: "postgresql://neondb_owner:npg_CwHW7iSd4nYB@ep-square-rice-am4n6lgl-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require"
};

for (const [key, value] of Object.entries(envs)) {
  console.log(`Setting ${key}...`);
  try {
    execSync(`echo "${value}" | npx vercel env add ${key} production`, { stdio: 'inherit' });
    execSync(`echo "${value}" | npx vercel env add ${key} preview`, { stdio: 'inherit' });
    execSync(`echo "${value}" | npx vercel env add ${key} development`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to set ${key}`, err.message);
  }
}
console.log("Finished pushing envs to Vercel!");
