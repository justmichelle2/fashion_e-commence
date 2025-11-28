const { z } = require('zod')
const { SUPPORTED_CURRENCY_CODES, BASE_CURRENCY } = require('./currency')

const idSchema = z.union([
  z.string().uuid('Invalid ID format'),
  z.string().regex(/^[0-9]+$/, 'Invalid ID format'),
])

const urlSchema = z.string().url('Invalid URL')

const cartAddSchema = z.object({
  productId: idSchema,
  quantity: z.coerce.number().int().min(1).max(10).default(1),
})

const cartRemoveSchema = z.object({
  productId: idSchema,
})

const checkoutSchema = z.object({
  shippingAddress: z.string().min(3).max(500),
  paymentMethod: z.string().min(2).max(120),
})

const stringArray = z.array(z.string().min(1).max(120)).max(20)

const productCreateSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(4000).optional().default(''),
  priceCents: z.coerce.number().int().min(1000),
  currency: z.enum(SUPPORTED_CURRENCY_CODES).optional().default(BASE_CURRENCY),
  category: z.string().max(120).optional(),
  tags: stringArray.optional().default([]),
  availability: z.enum(['in_stock', 'made_to_order', 'preorder']).optional(),
})

const productUpdateSchema = productCreateSchema.partial()

const designerPortfolioCreateSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional(),
  images: stringArray.optional().default([]),
})

const designerPortfolioUpdateSchema = designerPortfolioCreateSchema.partial()

const inspirationCreateSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional(),
  visibility: z.enum(['private', 'public']).optional().default('public'),
  media: stringArray.optional().default([]),
})

const customOrderCreateSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(2000).optional(),
  notes: z.string().max(2000).optional(),
  inspirationImages: z.array(urlSchema).max(10).optional().default([]),
  size: z.string().max(120).optional(),
  colorPalette: z.string().max(120).optional(),
  fabricPreference: z.string().max(120).optional(),
  templateId: idSchema.optional(),
  shippingAddress: z.string().min(3).max(500).optional(),
})

const customOrderRespondSchema = z
  .object({
    action: z.enum(['accept', 'reject']),
    quoteCents: z.coerce.number().int().min(1000).optional(),
    estimatedDeliveryDays: z.coerce.number().int().min(1).max(365).optional(),
  })
  .refine(
    (data) =>
      data.action === 'reject' ||
      (typeof data.quoteCents === 'number' && typeof data.estimatedDeliveryDays === 'number'),
    {
      message: 'quoteCents and estimatedDeliveryDays required when accepting',
      path: ['quoteCents'],
    }
  )

const customOrderStatusSchema = z.object({
  status: z
    .enum(['requested', 'quoted', 'in_progress', 'shipped', 'delivered', 'completed', 'rejected', 'cancelled'])
    .optional(),
  progressStep: z.string().max(120).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
  trackingUrl: urlSchema.optional(),
})

const customOrderAssetsSchema = z.object({
  inspirationImages: z.array(urlSchema).min(1).max(10),
})

function validate(schema, payload) {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0]
    return { error: issue?.message || 'Invalid payload' }
  }
  return { data: parsed.data }
}

module.exports = {
  validate,
  schemas: {
    cartAdd: cartAddSchema,
    cartRemove: cartRemoveSchema,
    checkout: checkoutSchema,
    productCreate: productCreateSchema,
    productUpdate: productUpdateSchema,
    designerPortfolioCreate: designerPortfolioCreateSchema,
    designerPortfolioUpdate: designerPortfolioUpdateSchema,
    inspirationCreate: inspirationCreateSchema,
    customOrderCreate: customOrderCreateSchema,
    customOrderRespond: customOrderRespondSchema,
    customOrderStatus: customOrderStatusSchema,
    customOrderAssets: customOrderAssetsSchema,
  },
}
