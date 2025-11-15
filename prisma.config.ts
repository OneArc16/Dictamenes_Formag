// prisma.config.ts (en la raíz)
import "dotenv/config";

export default {
  schema: "prisma/schema.prisma",
  // 👇 Si algún día necesitas la URL, NO llames env():
  // datasourceUrl: process.env.DATABASE_URL,
  
};
