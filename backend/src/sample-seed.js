require('dotenv').config()

const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ── 1. Superadmin ──────────────────────────────────────────────────────────
  const superAdminEmail = 'admin@renza.com'
  const superAdminPassword = 'renza2024'

  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } })
  let superAdmin

  if (existingSuperAdmin) {
    superAdmin = existingSuperAdmin
    console.log(`ℹ️  Superadmin already exists: ${superAdminEmail}`)
  } else {
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: await bcrypt.hash(superAdminPassword, 12),
        name: 'Renza Admin',
        role: 'superadmin',
      },
    })
    console.log('✅ Superadmin created')
    console.log(`   Email:    ${superAdminEmail}`)
    console.log(`   Password: ${superAdminPassword}`)
  }

  // ── 2. Sample Restaurant ───────────────────────────────────────────────────
  const restaurantSlug = 'abc-restaurant'
  let restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } })

  if (restaurant) {
    console.log(`\nℹ️  Restaurant already exists: ${restaurant.name}`)
  } else {
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'ABC Restaurant',
        slug: restaurantSlug,
        description:
          'Authentic South Indian cuisine with a modern twist. Known for our crispy dosas and flavorful biryanis.',
        cuisineType: 'South Indian',
        address: '42, MG Road, Bengaluru, Karnataka 560001',
        phone: '+91 80 2345 6789',
        status: 'active',
      },
    })
    console.log(`\n✅ Restaurant created: ${restaurant.name}`)
  }

  // ── 3. Restaurant Admin ────────────────────────────────────────────────────
  const restaurantAdminEmail = 'admin@abcrestaurant.com'
  const restaurantAdminPassword = 'restaurant123'

  const existingAdmin = await prisma.user.findUnique({ where: { email: restaurantAdminEmail } })
  let restaurantAdmin

  if (existingAdmin) {
    restaurantAdmin = existingAdmin
    console.log(`\nℹ️  Restaurant admin already exists: ${restaurantAdminEmail}`)
  } else {
    restaurantAdmin = await prisma.user.create({
      data: {
        email: restaurantAdminEmail,
        passwordHash: await bcrypt.hash(restaurantAdminPassword, 12),
        name: 'ABC Admin',
        role: 'restaurant_admin',
        restaurantId: restaurant.id,
      },
    })
    console.log('\n✅ Restaurant admin created')
    console.log(`   Email:    ${restaurantAdminEmail}`)
    console.log(`   Password: ${restaurantAdminPassword}`)
  }

  // ── 4. Categories ──────────────────────────────────────────────────────────
  const categoryNames = ['Starters', 'Biryani & Rice', 'Main Course', 'Drinks']
  const categories = {}

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i]
    let cat = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, name },
    })
    if (!cat) {
      cat = await prisma.category.create({
        data: { restaurantId: restaurant.id, name, sortOrder: i },
      })
    }
    categories[name] = cat
  }
  console.log(`\n✅ Categories: ${categoryNames.join(', ')}`)

  // ── 5. Food Items ──────────────────────────────────────────────────────────
  const foodItems = [
    {
      name: 'Masala Dosa',
      price: 89,
      categoryId: categories['Starters'].id,
      description: 'Crispy rice crepe filled with spiced potato masala, served with sambar and chutneys',
      ingredients: 'Rice batter, urad dal, potato, onion, mustard seeds, turmeric, green chilli',
      spices: 'Mustard seeds, turmeric, curry leaves, green chilli',
      allergens: 'Gluten-free (rice based)',
      portionSize: '1 piece',
      prepTime: '10 mins',
      calories: 280,
      isVeg: true,
      isJain: false,
      isVegan: true,
      isGlutenFree: true,
      spicyLevel: 1,
      specialTags: 'Bestseller',
      isAvailable: true,
      sortOrder: 0,
    },
    {
      name: 'Chicken 65',
      price: 220,
      categoryId: categories['Starters'].id,
      description: 'Crispy deep-fried chicken marinated in yogurt and spices, a Hyderabadi classic',
      ingredients: 'Chicken, yogurt, red chilli, ginger-garlic paste, curry leaves, egg',
      spices: 'Red chilli powder, garam masala, black pepper',
      allergens: 'Egg, Dairy',
      portionSize: '250g',
      prepTime: '20 mins',
      calories: 420,
      isVeg: false,
      isJain: false,
      isVegan: false,
      isGlutenFree: false,
      spicyLevel: 3,
      specialTags: 'Chef Special',
      isAvailable: true,
      sortOrder: 1,
    },
    {
      name: 'Paneer Tikka',
      price: 199,
      categoryId: categories['Starters'].id,
      description: 'Marinated cottage cheese grilled in tandoor with bell peppers and onions',
      ingredients: 'Paneer, yogurt, capsicum, onion, tomato, ginger-garlic paste',
      spices: 'Tandoori masala, red chilli, cumin',
      allergens: 'Dairy',
      portionSize: '300g',
      prepTime: '15 mins',
      calories: 350,
      isVeg: true,
      isJain: false,
      isVegan: false,
      isGlutenFree: true,
      spicyLevel: 2,
      specialTags: 'Popular',
      isAvailable: true,
      sortOrder: 2,
    },
    {
      name: 'Chicken Biryani',
      price: 299,
      categoryId: categories['Biryani & Rice'].id,
      description: 'Fragrant basmati rice slow-cooked with tender chicken and aromatic whole spices',
      ingredients: 'Basmati rice, chicken, onion, tomato, mint, saffron, ghee, whole spices',
      spices: 'Cardamom, cloves, cinnamon, bay leaf, star anise, saffron',
      allergens: 'Dairy (ghee)',
      portionSize: 'Full plate (~500g)',
      prepTime: '40 mins',
      calories: 650,
      isVeg: false,
      isJain: false,
      isVegan: false,
      isGlutenFree: true,
      spicyLevel: 2,
      specialTags: 'Bestseller',
      isAvailable: true,
      sortOrder: 0,
    },
    {
      name: 'Veg Dum Biryani',
      price: 229,
      categoryId: categories['Biryani & Rice'].id,
      description: 'Aromatic basmati rice slow-cooked with seasonal vegetables and saffron',
      ingredients: 'Basmati rice, mixed vegetables, onion, mint, yogurt, saffron, ghee',
      spices: 'Whole spices, biryani masala, saffron',
      allergens: 'Dairy',
      portionSize: 'Full plate (~450g)',
      prepTime: '35 mins',
      calories: 480,
      isVeg: true,
      isJain: false,
      isVegan: false,
      isGlutenFree: true,
      spicyLevel: 1,
      specialTags: null,
      isAvailable: true,
      sortOrder: 1,
    },
    {
      name: 'Butter Chicken',
      price: 320,
      categoryId: categories['Main Course'].id,
      description: 'Tender chicken in a rich, creamy tomato-butter sauce — a North Indian classic',
      ingredients: 'Chicken, tomato, butter, cream, cashews, ginger-garlic paste, kasuri methi',
      spices: 'Kashmiri red chilli, garam masala, fenugreek',
      allergens: 'Dairy, Nuts (cashew)',
      portionSize: '300g + 2 rotis',
      prepTime: '25 mins',
      calories: 520,
      isVeg: false,
      isJain: false,
      isVegan: false,
      isGlutenFree: false,
      spicyLevel: 1,
      specialTags: 'Must Try',
      isAvailable: true,
      sortOrder: 0,
    },
    {
      name: 'Dal Makhani',
      price: 189,
      categoryId: categories['Main Course'].id,
      description: 'Black lentils slow-simmered overnight with butter and cream — rich and comforting',
      ingredients: 'Black urad dal, kidney beans, tomato, butter, cream, onion, ginger-garlic',
      spices: 'Cumin, garam masala, red chilli',
      allergens: 'Dairy',
      portionSize: '250ml bowl',
      prepTime: '10 mins (slow-cooked overnight)',
      calories: 310,
      isVeg: true,
      isJain: false,
      isVegan: false,
      isGlutenFree: true,
      spicyLevel: 1,
      specialTags: 'Veg Special',
      isAvailable: false, // Currently unavailable
      sortOrder: 1,
    },
    {
      name: 'Fresh Lime Soda',
      price: 59,
      categoryId: categories['Drinks'].id,
      description: 'Refreshing fresh lime with soda water, choice of sweet, salty or mixed',
      ingredients: 'Fresh lime, soda water, sugar, black salt',
      spices: null,
      allergens: null,
      portionSize: '300ml',
      prepTime: '2 mins',
      calories: 45,
      isVeg: true,
      isJain: true,
      isVegan: true,
      isGlutenFree: true,
      spicyLevel: 0,
      specialTags: null,
      isAvailable: true,
      sortOrder: 0,
    },
  ]

  let createdCount = 0
  for (const item of foodItems) {
    const exists = await prisma.foodItem.findFirst({
      where: { restaurantId: restaurant.id, name: item.name },
    })
    if (!exists) {
      await prisma.foodItem.create({
        data: { restaurantId: restaurant.id, ...item },
      })
      createdCount++
    }
  }
  console.log(`\n✅ Food items: ${createdCount} created (${foodItems.length - createdCount} already existed)`)

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('🎉 Seed complete!\n')
  console.log('Credentials:')
  console.log(`  Superadmin      → ${superAdminEmail} / ${superAdminPassword}`)
  console.log(`  Restaurant Admin→ ${restaurantAdminEmail} / ${restaurantAdminPassword}`)
  console.log(`\nMenu URL: http://localhost:3003/menu/${restaurantSlug}`)
  console.log('─'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
