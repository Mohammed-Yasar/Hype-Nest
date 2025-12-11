import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';

dotenv.config();

// Helper to generate dates spread across last 90 days
const randomDateInPast90Days = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  return new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
};

// 10 sample users: 3 sellers, 1 admin, 6 regular users
const sampleUsers = [
  {
    name: 'Alex Chen',
    email: 'alex@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Jordan Smith',
    email: 'jordan@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Taylor Williams',
    email: 'taylor@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Admin User',
    email: 'admin@hype.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Sam Johnson',
    email: 'sam@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Casey Brown',
    email: 'casey@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Riley Davis',
    email: 'riley@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Morgan Miller',
    email: 'morgan@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Quinn Anderson',
    email: 'quinn@hype.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Avery Martinez',
    email: 'avery@hype.com',
    password: 'password123',
    role: 'user',
  },
];

// 40 products across categories
const generateProducts = (sellerIds) => {
  const products = [];
  const brands = ['Nike', 'Jordan', 'Adidas', 'Yeezy', 'Supreme', 'Bape', 'Off-White', 'Travis Scott', 'PALACE', 'Stussy', 'Fragment', 'Medicom', 'Kaws', 'Bearbrick'];
  const categories = ['sneakers', 'streetwear', 'collectibles', 'other'];
  
  const productTemplates = [
    // Sneakers (16 products)
    { title: 'Nike Dunk Low Panda', brand: 'Nike', category: 'sneakers', price: 220, desc: 'Classic black and white colorway. DS with box, size 10.', imgSeed: 'dunk1' },
    { title: 'Jordan 1 High OG Chicago', brand: 'Jordan', category: 'sneakers', price: 850, desc: '2022 reimagined release. Deadstock, size 10.5.', imgSeed: 'jordan1' },
    { title: 'Adidas Yeezy 350 V2 Zebra', brand: 'Yeezy', category: 'sneakers', price: 450, desc: '2022 restock. VNDS condition, comes with box.', imgSeed: 'yeezy1' },
    { title: 'Nike SB Dunk Low Travis Scott', brand: 'Travis Scott', category: 'sneakers', price: 1200, desc: 'Rare collaboration. Used but clean, size 11.', imgSeed: 'travis1' },
    { title: 'Jordan 4 Retro Black Cat', brand: 'Jordan', category: 'sneakers', price: 650, desc: '2020 release. DS condition, size 9.', imgSeed: 'jordan4' },
    { title: 'Nike Air Force 1 Off-White', brand: 'Off-White', category: 'sneakers', price: 1800, desc: 'Limited collaboration. VNDS, size 10.', imgSeed: 'offwhite1' },
    { title: 'Adidas Yeezy 700 Wave Runner', brand: 'Yeezy', category: 'sneakers', price: 520, desc: 'OG colorway. Worn a few times, excellent condition.', imgSeed: 'yeezy700' },
    { title: 'Jordan 1 Low Fragment x Travis Scott', brand: 'Travis Scott', category: 'sneakers', price: 1450, desc: 'Double collaboration. DS with all accessories.', imgSeed: 'fragment1' },
    { title: 'Nike Dunk High Purple', brand: 'Nike', category: 'sneakers', price: 280, desc: 'Vintage colorway. Clean used pair, size 9.5.', imgSeed: 'dunk2' },
    { title: 'Jordan 3 White Cement Reimagined', brand: 'Jordan', category: 'sneakers', price: 380, desc: '2023 release. Deadstock, size 11.', imgSeed: 'jordan3' },
    { title: 'Adidas Yeezy Slide Pure', brand: 'Yeezy', category: 'sneakers', price: 150, desc: 'Comfortable slides. New with box, size 10.', imgSeed: 'slide1' },
    { title: 'Nike SB Dunk Low Staple Pigeon', brand: 'Nike', category: 'sneakers', price: 950, desc: 'Legendary SB Dunk. Worn carefully, size 10.5.', imgSeed: 'sb1' },
    { title: 'Jordan 1 High Union LA Blue Toe', brand: 'Jordan', category: 'sneakers', price: 2100, desc: 'Exclusive collaboration. VNDS, size 9.', imgSeed: 'union1' },
    { title: 'Nike Air Max 97 Off-White', brand: 'Off-White', category: 'sneakers', price: 1650, desc: 'Iconic design. Used condition, size 10.', imgSeed: 'airmax1' },
    { title: 'Adidas Yeezy 380 Alien', brand: 'Yeezy', category: 'sneakers', price: 580, desc: 'Unique silhouette. DS condition, size 10.5.', imgSeed: '380' },
    { title: 'Jordan 5 Retro Fire Red', brand: 'Jordan', category: 'sneakers', price: 420, desc: '2020 release. Clean pair, size 11.', imgSeed: 'jordan5' },
    
    // Streetwear (12 products)
    { title: 'Supreme Box Logo Hoodie FW20', brand: 'Supreme', category: 'streetwear', price: 850, desc: 'Black on black box logo. Size L, worn lightly.', imgSeed: 'supreme1' },
    { title: 'Bape Shark Full Zip Hoodie', brand: 'Bape', category: 'streetwear', price: 650, desc: 'Classic shark design. Size M, excellent condition.', imgSeed: 'bape1' },
    { title: 'Off-White Caravaggio Hoodie', brand: 'Off-White', category: 'streetwear', price: 1200, desc: 'Artistic design. Size XL, DS condition.', imgSeed: 'offwhite2' },
    { title: 'PALACE Tri-Ferg Tee', brand: 'PALACE', category: 'streetwear', price: 180, desc: 'Iconic logo tee. Size L, new with tags.', imgSeed: 'palace1' },
    { title: 'Supreme TNF Mountain Jacket', brand: 'Supreme', category: 'streetwear', price: 2100, desc: 'Collaboration piece. Size M, excellent condition.', imgSeed: 'tnf1' },
    { title: 'Stussy World Tour Hoodie', brand: 'Stussy', category: 'streetwear', price: 220, desc: 'Classic design. Size L, worn a few times.', imgSeed: 'stussy1' },
    { title: 'Bape Camo Shark Shorts', brand: 'Bape', category: 'streetwear', price: 450, desc: 'Summer staple. Size L, new condition.', imgSeed: 'bape2' },
    { title: 'Off-White Industrial Belt', brand: 'Off-White', category: 'streetwear', price: 280, desc: 'Yellow industrial belt. One size, DS.', imgSeed: 'belt1' },
    { title: 'Supreme Box Logo Tee SS21', brand: 'Supreme', category: 'streetwear', price: 520, desc: 'White box logo. Size M, worn once.', imgSeed: 'supreme2' },
    { title: 'PALACE Script Hoodie', brand: 'PALACE', category: 'streetwear', price: 380, desc: 'Comfortable hoodie. Size L, excellent condition.', imgSeed: 'palace2' },
    { title: 'Stussy 8 Ball Fleece', brand: 'Stussy', category: 'streetwear', price: 180, desc: 'Retro design. Size M, new with tags.', imgSeed: 'stussy2' },
    { title: 'Bape College Logo Tee', brand: 'Bape', category: 'streetwear', price: 150, desc: 'Campus style. Size L, clean used.', imgSeed: 'bape3' },
    
    // Collectibles (8 products)
    { title: 'Bearbrick 400% Space Edition', brand: 'Bearbrick', category: 'collectibles', price: 350, desc: 'Limited space theme. Display only, original box.', imgSeed: 'bearbrick1' },
    { title: 'Kaws Companion Flayed (Black)', brand: 'Kaws', category: 'collectibles', price: 2800, desc: 'Iconic design. Mint condition, with box.', imgSeed: 'kaws1' },
    { title: 'Bearbrick 1000% Medicom x Fragment', brand: 'Fragment', category: 'collectibles', price: 2500, desc: 'Rare collaboration. New in box.', imgSeed: 'fragment2' },
    { title: 'Funko Pop Travis Scott', brand: 'Travis Scott', category: 'collectibles', price: 120, desc: 'Limited edition. Mint in box.', imgSeed: 'funko1' },
    { title: 'Kaws BFF Plush (Pink)', brand: 'Kaws', category: 'collectibles', price: 850, desc: 'Soft plush companion. New with tags.', imgSeed: 'kaws2' },
    { title: 'Bearbrick 400% Mastermind Japan', brand: 'Bearbrick', category: 'collectibles', price: 680, desc: 'Exclusive design. Display quality.', imgSeed: 'mastermind1' },
    { title: 'KAWS Small Lie (Brown)', brand: 'Kaws', category: 'collectibles', price: 3200, desc: 'Popular figure. Mint condition, boxed.', imgSeed: 'kaws3' },
    { title: 'Bearbrick 100% Series 45', brand: 'Bearbrick', category: 'collectibles', price: 45, desc: 'Series 45 collectible. New in package.', imgSeed: 'bearbrick2' },
    
    // Other (4 products)
    { title: 'Supreme x The North Face Backpack', brand: 'Supreme', category: 'other', price: 580, desc: 'Collaboration backpack. Used but clean.', imgSeed: 'backpack1' },
    { title: 'Off-White Industrial Key Holder', brand: 'Off-White', category: 'other', price: 180, desc: 'Unique accessory. New condition.', imgSeed: 'keyholder1' },
    { title: 'Bape Headphone Stand', brand: 'Bape', category: 'other', price: 220, desc: 'Functional decor. Mint condition.', imgSeed: 'stand1' },
    { title: 'Stussy Beach Towel', brand: 'Stussy', category: 'other', price: 95, desc: 'Summer essential. New with tags.', imgSeed: 'towel1' },
  ];

  // Assign products to sellers and add timestamps
  const sellers = sellerIds.slice(0, 3); // First 3 users are sellers
  let productIndex = 0;
  
  productTemplates.forEach((template) => {
    // Cycle through sellers
    const sellerId = sellers[productIndex % sellers.length];
    const createdAt = randomDateInPast90Days();
    
    // 90% approved, 10% pending
    const status = Math.random() > 0.1 ? 'approved' : 'pending';
    
    // Generate badges (30% chance for "hot", 20% for "new", 15% for "limited")
    const badges = [];
    if (Math.random() < 0.3) badges.push('hot');
    if (Math.random() < 0.2) badges.push('new');
    if (Math.random() < 0.15) badges.push('limited');
    // High price items get "premium" badge
    if (template.price > 1000) badges.push('premium');
    
    // Generate image URL using picsum or placeholder
    const imgSeed = template.imgSeed || `product${productIndex}`;
    const imageUrl = `https://picsum.photos/seed/${imgSeed}/800/600`;
    
    products.push({
      title: template.title,
      description: template.desc,
      price: template.price,
      brand: template.brand,
      category: template.category,
      images: [imageUrl],
      seller: sellerId,
      status: status,
      badges: badges,
      createdAt: createdAt,
      updatedAt: createdAt,
    });
    
    productIndex++;
  });

  return products;
};

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hypenest';
  
  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI not found in .env. Using fallback:', mongoUri);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clear existing seed data (optional - comment out to keep existing)
    console.log('Clearing existing seed data...');
    await Product.deleteMany({});
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    console.log('✓ Cleared old seed data');

    // Create users (idempotent - upsert by email)
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        createdUsers.push(existing);
        console.log(`  → User already exists: ${userData.email}`);
      } else {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`  ✓ Created user: ${userData.name} (${userData.email})`);
      }
    }

    // Get seller IDs (first 3 users with role 'user')
    const sellers = createdUsers.filter(u => u.role === 'user').slice(0, 3);
    const admin = createdUsers.find(u => u.role === 'admin');
    
    if (sellers.length < 3) {
      throw new Error('Not enough seller users created');
    }

    console.log(`\n✓ Created ${createdUsers.length} users (${sellers.length} sellers, 1 admin)`);

    // Generate and insert products
    console.log('\nGenerating products...');
    const productsToInsert = generateProducts(sellers.map(s => s._id));
    
    const inserted = await Product.insertMany(productsToInsert);
    
    const approvedCount = inserted.filter(p => p.status === 'approved').length;
    const pendingCount = inserted.filter(p => p.status === 'pending').length;

    // Create sample activities
    console.log('\nCreating sample activities...');
    const activities = [];
    for (let i = 0; i < Math.min(20, inserted.length); i++) {
      const product = inserted[i];
      const seller = sellers.find(s => s._id.toString() === product.seller.toString());
      if (seller) {
        activities.push({
          type: product.status === 'approved' ? 'product_approved' : 'product_created',
          user: seller._id,
          product: product._id,
          message: `${seller.name}'s product "${product.title}" was ${product.status === 'approved' ? 'approved' : 'created'}`,
          createdAt: product.createdAt,
        });
      }
    }
    // Add some user registration activities
    createdUsers.slice(0, 5).forEach(user => {
      activities.push({
        type: 'user_registered',
        user: user._id,
        message: `${user.name} joined HypeNest`,
        createdAt: user.createdAt,
      });
    });
    await Activity.insertMany(activities);
    console.log(`  ✓ Created ${activities.length} activities`);

    // Create sample notifications for sellers
    console.log('\nCreating sample notifications...');
    const notifications = [];
    inserted.filter(p => p.status === 'approved').slice(0, 10).forEach(product => {
      notifications.push({
        user: product.seller,
        type: 'product_approved',
        title: 'Product Approved',
        message: `Your product "${product.title}" has been approved and is now live!`,
        link: `/products/${product._id}`,
        read: false,
        createdAt: product.createdAt,
      });
    });
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`  ✓ Created ${notifications.length} notifications`);
    }

    console.log(`\n✓ Seed complete!`);
    console.log(`  → Users: ${createdUsers.length}`);
    console.log(`  → Products: ${inserted.length} (${approvedCount} approved, ${pendingCount} pending)`);
    console.log(`  → Activities: ${activities.length}`);
    console.log(`  → Notifications: ${notifications.length}`);
    console.log(`  → Example Product IDs: ${inserted.slice(0, 3).map(p => p._id).join(', ')}`);
    console.log('\n📝 Login credentials:');
    console.log(`  Sellers: ${sellers[0].email} / password123`);
    console.log(`  Admin: ${admin.email} / password123`);
    console.log(`  Users: ${createdUsers.filter(u => u.role === 'user').slice(3, 6).map(u => u.email).join(', ')} / password123`);
    
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
};

seed();
