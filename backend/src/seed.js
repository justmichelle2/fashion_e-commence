const { sequelize, User, Product, CustomOrder, Order, DesignerTemplate, ChatMessage } = require('./models');

async function seed(){
  await sequelize.sync({ force: true });
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', role: 'admin' });
  await admin.setPassword('adminpass');
  await admin.save();

  const designer = await User.create({
    name: 'Jane Designer',
    email: 'designer@example.com',
    role: 'designer',
    bio: 'Contemporary womenswear with global shipping',
    avatarUrl: '/images/designer1.jpg',
    location: 'Accra, Ghana',
    preferredCurrency: 'USD',
    onboardingComplete: true,
    verified: true,
    portfolioUrl: 'https://example.com/jane'
  });
  await designer.setPassword('designerpass');
  await designer.save();

  const customer = await User.create({
    name: 'Alice Customer',
    email: 'customer@example.com',
    role: 'customer',
    location: 'London, UK',
    preferredCurrency: 'GBP',
    preferredSize: 'M',
    onboardingComplete: true
  });
  await customer.setPassword('customerpass');
  await customer.save();

  const templates = await DesignerTemplate.bulkCreate([
    {
      designerId: designer.id,
      title: 'Evening silhouette',
      description: 'Luxurious evening gown base template',
      coverImage: '/images/template1.jpg',
      tags: ['evening','silk'],
      basePriceCents: 250000
    },
    {
      designerId: designer.id,
      title: 'Minimal suit',
      description: 'Tailored two-piece suit pattern',
      coverImage: '/images/template2.jpg',
      tags: ['tailoring'],
      basePriceCents: 180000
    }
  ]);

  const products = await Product.bulkCreate([
    {
      title: 'Silk Dress',
      description: 'Elegant silk dress with draped details',
      priceCents: 150000,
      currency: 'USD',
      designerId: designer.id,
      images: ['/images/sample1.svg'],
      category: 'Dresses',
      tags: ['evening','silk'],
      availability: 'made_to_order'
    },
    {
      title: 'Tailored Blazer',
      description: 'Structured blazer in charcoal wool',
      priceCents: 98000,
      currency: 'USD',
      designerId: designer.id,
      images: ['/images/sample2.svg'],
      category: 'Outerwear',
      tags: ['tailoring'],
      isFeatured: true
    }
  ]);

  const customOrder = await CustomOrder.create({
    title: 'Custom midnight gown',
    description: 'Client wants a fitted gown with open back',
    inspirationImages: ['/uploads/mock/inspo1.jpg'],
    size: 'M',
    colorPalette: 'Midnight navy',
    fabricPreference: '100% silk',
    notes: 'Include slit and detachable train',
    status: 'quoted',
    progressStep: 'sketch',
    templateId: templates[0].id,
    quoteCents: 320000,
    depositCents: 100000,
    paymentStatus: 'deposit_paid',
    designerId: designer.id,
    customerId: customer.id,
    shippingAddress: { country: 'UK', city: 'London' }
  });

  await ChatMessage.create({ customOrderId: customOrder.id, senderId: designer.id, message: 'Sharing initial sketch for your review.' });
  await ChatMessage.create({ customOrderId: customOrder.id, senderId: customer.id, message: 'Love the silhouette, can we make the slit a bit higher?' });

  await Order.create({
    customerId: customer.id,
    designerId: designer.id,
    status: 'in_production',
    type: 'custom',
    items: [{ productId: products[0].id, title: products[0].title, quantity: 1, priceCents: products[0].priceCents }],
    subtotalCents: products[0].priceCents,
    taxCents: 12000,
    shippingCents: 1500,
    totalCents: products[0].priceCents + 12000 + 1500,
    customOrderId: customOrder.id,
    currency: 'USD'
  });

  console.log('Seeded: admin@example.com/adminpass, designer@example.com/designerpass, customer@example.com/customerpass');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
