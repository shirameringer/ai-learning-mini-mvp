import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // קטגוריה ראשית
  const web = await prisma.category.upsert({
    where: { name: "Web Development" },
    update: {},
    create: { name: "Web Development" },
  });

  // תתי קטגוריות
  await prisma.subCategory.upsert({
    where: { name_categoryId: { name: "HTML Basics", categoryId: web.id } },
    update: {},
    create: { name: "HTML Basics", categoryId: web.id },
  });

  await prisma.subCategory.upsert({
    where: { name_categoryId: { name: "CSS Fundamentals", categoryId: web.id } },
    update: {},
    create: { name: "CSS Fundamentals", categoryId: web.id },
  });

  console.log("✅ Seed completed");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
