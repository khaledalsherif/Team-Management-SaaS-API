import 'dotenv/config';

import app from './app';
import { prisma } from './lib/prisma';
import 'dotenv/config';

async function startDB() {
  try {
    await prisma.$connect();

    console.log('DB connected successfullys');
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect;
  }
}

startDB();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
