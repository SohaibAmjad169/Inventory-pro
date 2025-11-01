import prisma from './database/client';
import logger from './utils/logger';
import { UserRole, POStatus } from '@prisma/client';

/**
 * Seed database with an approved purchase order for testing Goods Receipt
 */
async function seedApprovedPO() {
  try {
    logger.info('🌱 Seeding approved purchase order...');

    // Get owner user
    const owner = await prisma.user.findFirst({
      where: { role: UserRole.owner_ultimate_super_admin },
    });
    if (!owner) {
      logger.error('No owner user found. Please seed users first.');
      return;
    }

    // Get a product
    const product = await prisma.product.findFirst();
    if (!product) {
      logger.error('No product found. Please seed products first.');
      return;
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: 'Test Supplier',
        contact_person: 'Supplier Contact',
        email: 'supplier@example.com',
        phone: '+1-555-1234',
        address: '123 Supplier St',
        is_active: true,
      },
    });

    // Create purchase order
    const po = await prisma.purchaseOrder.create({
      data: {
        po_number: 'PO-0001',
        supplier_id: supplier.id,
        status: POStatus.APPROVED,
        created_by_id: owner.id,
        items: {
          create: [{
            product_id: product.id,
            quantity: 10,
            received_quantity: 0,
            unit_price: 100,
          }],
        },
      },
      include: { items: true },
    });

    logger.info(`✅ Created approved PO: ${po.po_number}`);
  } catch (err) {
    logger.error('Failed to seed approved PO: ' + String(err));
  }
}

seedApprovedPO();
