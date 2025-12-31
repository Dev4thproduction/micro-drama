const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Series = require('../src/models/Series');
const Episode = require('../src/models/Episode');
const User = require('../src/models/User');

// Load environment variables
dotenv.config({ path: '../.env' }); // Adjust path if .env is in root backend folder

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/micro_drama';

const FEATURED_DATA = [
  {
    title: "The Last Starlight",
    description: "A journey into the unknown depths of the cosmos. When the final star begins to fade, one pilot must race against time itself.",
    tags: ["Sci-Fi", "Space"],
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop"
  },
  {
    title: "Neon City",
    description: "In a world ruled by corporations, a street hacker uncovers a conspiracy that could topple the regime.",
    tags: ["Cyberpunk", "Action"],
    coverImage: "https://images.unsplash.com/photo-1574365736791-c91834e554b7?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Silent Hill",
    description: "A foggy town holds secrets that should have stayed buried. A psychological horror experience.",
    tags: ["Horror", "Mystery"],
    coverImage: "https://images.unsplash.com/photo-1481018085669-2bc6e6f00499?q=80&w=1600&auto=format&fit=crop"
  }
];

const TRENDING_DATA = [
  { title: "Velvet Nights", tags: ["Romance"], coverImage: "https://images.unsplash.com/photo-1518544806352-a1c431658085?q=80&w=600" },
  { title: "Cyber Drifter", tags: ["Sci-Fi"], coverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600" },
  { title: "Empire of Ash", tags: ["Fantasy"], coverImage: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=600" },
  { title: "The Deep", tags: ["Thriller"], coverImage: "https://images.unsplash.com/photo-1497551060073-4c5ab6435f12?q=80&w=600" },
  { title: "Solaris", tags: ["Space"], coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600" },
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB...');

    // 1. Create/Find a Creator
    let creator = await User.findOne({ email: 'studio@microdrama.com' });
    if (!creator) {
      const hash = await bcrypt.hash('password123', 10);
      creator = await User.create({
        email: 'studio@microdrama.com',
        passwordHash: hash,
        displayName: 'Micro Studio',
        role: 'creator',
        status: 'active'
      });
      console.log('👤 Creator account created.');
    }

    // 2. Clear existing Series to avoid duplicates
    await Series.deleteMany({});
    await Episode.deleteMany({});
    console.log('🧹 Old data cleared.');

    // 3. Insert Featured Series
    for (const item of FEATURED_DATA) {
      await Series.create({
        ...item,
        creator: creator._id,
        status: 'published',
        // We are temporarily storing the image URL in 'description' or a specific field
        // If your schema doesn't have 'coverImage', update the model or use 'description' as hack
        // For this script, I assume you added 'coverImage' to Series model, OR we put it in description for now.
        // Let's assume we use description for text and pass image in frontend via other means or update schema.
        // To make it easy: I will append image url to description if schema not updated.
        // Better way: Update Schema. I will assume Schema Update in Step 2.
      });
    }

    // 4. Insert Trending Series
    for (const item of TRENDING_DATA) {
      await Series.create({
        ...item,
        description: "A trending series loved by millions.",
        creator: creator._id,
        status: 'published'
      });
    }

    console.log('✅ Database seeded with Featured & Trending content!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();