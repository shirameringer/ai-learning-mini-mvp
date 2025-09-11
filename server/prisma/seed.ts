// server/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


type SeedItem = { name: string; subs: string[] };

// === 6 New High-School categories ===
const CATALOG: SeedItem[] = [
  { name: "Mathematics", subs: ["Algebra", "Geometry", "Trigonometry", "Calculus"] },
  { name: "Physics", subs: ["Mechanics", "Electricity & Magnetism", "Waves & Optics"] },
  { name: "Chemistry", subs: ["General Chemistry", "Organic Chemistry", "Analytical Chemistry"] },
  { name: "Biology", subs: ["Cell Biology", "Genetics", "Human Physiology"] },
  { name: "Computer Science", subs: ["Programming Basics", "Data Structures", "Web Development"] },
  { name: "English Language", subs: ["Grammar", "Reading Comprehension", "Essay Writing"] },
];

async function main() {
  // 1) wipe existing data (order matters to satisfy FK)
  await prisma.$transaction([
    prisma.lesson.deleteMany({}),       // lessons first (refer to subCategory/category)
    prisma.subCategory.deleteMany({}),
    prisma.category.deleteMany({}),
  ]);

  // 2) insert fresh catalog
  for (const item of CATALOG) {
    const cat = await prisma.category.create({ data: { name: item.name } });
    for (const sub of item.subs) {
      await prisma.subCategory.create({
        data: { name: sub, categoryId: cat.id },
      });
    }
  }

  console.log(`✅ Seed completed. Created ${CATALOG.length} categories.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
