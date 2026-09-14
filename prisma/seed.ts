import { ArticleStatus, IssuePriority, IssueStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@ruangfakta.local" },
    update: { name: "Ruang Fakta", role: "ADMIN" },
    create: { email: "admin@ruangfakta.local", name: "Ruang Fakta", role: "ADMIN" },
  });

  const category = await prisma.category.upsert({
    where: { slug: "nasional" },
    update: { name: "Nasional" },
    create: { name: "Nasional", slug: "nasional", description: "Isu dan informasi nasional" },
  });

  await prisma.article.upsert({
    where: { slug: "ruang-fakta-untuk-informasi-publik" },
    update: {},
    create: {
      title: "Ruang Fakta untuk Informasi Publik",
      slug: "ruang-fakta-untuk-informasi-publik",
      excerpt: "Ruang Fakta menjadi ruang untuk menghimpun informasi, laporan masyarakat dan perkembangan isu publik.",
      content: "Ruang Fakta dibangun sebagai ruang informasi publik yang berfokus pada isu masyarakat, wilayah, data dan perkembangan fakta.",
      categoryId: category.id,
      status: ArticleStatus.PUBLISHED,
      isPublished: true,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.issue.upsert({
    where: { slug: "contoh-pemantauan-isu-publik" },
    update: {},
    create: {
      title: "Contoh Pemantauan Isu Publik",
      slug: "contoh-pemantauan-isu-publik",
      summary: "Contoh data isu untuk memastikan sistem Ruang Fakta dapat berjalan.",
      description: "Data contoh ini digunakan sebagai data awal untuk pengembangan sistem pemantauan isu nasional sampai wilayah.",
      categoryId: category.id,
      status: IssueStatus.MONITORING,
      priority: IssuePriority.MEDIUM,
      province: "Indonesia",
      reporterName: "Ruang Fakta",
      reporterId: admin.id,
    },
  });

  console.log("Seed selesai.");
}

main().then(() => prisma.$disconnect()).catch(async error => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
