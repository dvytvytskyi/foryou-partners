import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) throw new Error('No admin found');

  await prisma.knowledgeArticle.deleteMany();

  await prisma.knowledgeArticle.createMany({
    data: [
      {
        titleRu: 'Эксклюзивные проекты в Дубае',
        titleEn: 'Co-exclusive projects in Dubai',
        descriptionRu: 'Вы можете скачать полную презентацию эксклюзивных проектов по ссылке ниже.\n\n**Преимущества:**\n- Отличный ROI\n- Лучшие локации\n- Гибкая рассрочка',
        descriptionEn: 'You can download the full presentation of exclusive and co-exclusive projects via the link.\n\n**Highlights:**\n- Great ROI\n- Prime locations\n- Flexible payment plans',
        linksRu: [{ title: 'Скачать PDF', url: 'https://example.com/presentation.pdf' }],
        linksEn: [{ title: 'Download Presentation PDF', url: 'https://example.com/presentation.pdf' }],
        authorId: admin.id,
      },
      {
        titleRu: 'ВНЖ и Гражданство: Дубай, Абу-Даби',
        titleEn: 'Residence Permit and Citizenship: Dubai, Abu Dhabi',
        descriptionRu: 'Новые условия в декабре 2026. Получите золотую визу за инвестиции.\n\nНеобходимые документы:\n- Копия паспорта\n- Право собственности\n- Медицинская страховка',
        descriptionEn: 'New conditions in December 2026. Get your golden visa by investing in real estate.\n\nRequired documents:\n- Passport copy\n- Title deed\n- Proof of health insurance',
        linksRu: [{ title: 'Гос. портал', url: 'https://example.com/gov' }],
        linksEn: [{ title: 'Government Portal', url: 'https://example.com/gov' }],
        authorId: admin.id,
      },
      {
        titleRu: 'Тренинг по трендам рынка ОАЭ',
        titleEn: 'Meeting / training on modern UAE market trends',
        descriptionRu: 'Присоединяйтесь к нашему вебинару о трендах рынка недвижимости ОАЭ. Мы обсудим *off-plan*, *вторичный рынок* и *доходность от аренды*.',
        descriptionEn: 'Join us for our weekly webinar discussing the latest trends in the UAE real estate market. We cover *off-plan projects*, *secondary market analysis*, and *rental yields*.',
        linksRu: [{ title: 'Ссылка на Zoom', url: 'https://zoom.us/j/123456789' }],
        linksEn: [{ title: 'Zoom Link', url: 'https://zoom.us/j/123456789' }],
        authorId: admin.id,
      },
      {
        titleRu: 'ТОП-5 проектов мая',
        titleEn: 'TOP 5 Dubai projects in May',
        descriptionRu: 'Список лучших 5 проектов, запускаемых в этом мае.\n\n1. Emaar Beachfront\n2. Damac Lagoons\n3. Nakheel Palm Jebel Ali\n4. Sobha Hartland\n5. Meraas City Walk',
        descriptionEn: 'A curated list of the top 5 projects launching this May. Don\'t miss out on these incredible investment opportunities!\n\n1. Emaar Beachfront\n2. Damac Lagoons\n3. Nakheel Palm Jebel Ali\n4. Sobha Hartland\n5. Meraas City Walk',
        linksRu: [],
        linksEn: [],
        authorId: admin.id,
      }
    ]
  });
  console.log('Knowledge articles seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
