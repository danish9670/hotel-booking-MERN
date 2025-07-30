const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
require('./database/mongoose'); // Use existing connection logic

// Sample room data
const sampleRooms = [
  {
    title: "Deluxe Ocean View Suite",
    description: "Experience luxury with our spacious ocean view suite featuring a private balcony, king-size bed, and stunning panoramic views of the ocean. Perfect for romantic getaways or business travelers seeking comfort.",
    price: 299,
    type: "Deluxe",
    capacity: 2,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service", "Balcony", "Ocean View"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
    ],
    floor: 5,
    roomNumber: "501",
    isAvailable: true
  },
  {
    title: "Executive Business Suite",
    description: "Designed for the modern business traveler, this suite offers a dedicated workspace, high-speed internet, and premium amenities. Includes a separate living area and work desk.",
    price: 199,
    type: "Suite",
    capacity: 2,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service", "Kitchen"],
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800"
    ],
    floor: 3,
    roomNumber: "301",
    isAvailable: true
  },
  {
    title: "Cozy Single Room",
    description: "Perfect for solo travelers, this comfortable single room offers all essential amenities in a compact, well-designed space. Great value for budget-conscious guests.",
    price: 89,
    type: "Single",
    capacity: 1,
    amenities: ["WiFi", "TV", "AC"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800"
    ],
    floor: 2,
    roomNumber: "201",
    isAvailable: true
  },
  {
    title: "Family Double Room",
    description: "Spacious double room perfect for families or small groups. Features two comfortable beds, extra storage space, and family-friendly amenities.",
    price: 149,
    type: "Double",
    capacity: 4,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800"
    ],
    floor: 2,
    roomNumber: "202",
    isAvailable: true
  },
  {
    title: "Presidential Suite",
    description: "Our most luxurious accommodation featuring premium furnishings, panoramic city views, private dining area, and exclusive butler service. The ultimate in luxury and comfort.",
    price: 599,
    type: "Presidential",
    capacity: 4,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service", "Balcony", "Kitchen", "Jacuzzi"],
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800"
    ],
    floor: 10,
    roomNumber: "1001",
    isAvailable: true
  },
  {
    title: "Mountain View Deluxe",
    description: "Enjoy breathtaking mountain views from this deluxe room featuring a private balcony, premium bedding, and modern amenities. Perfect for nature lovers.",
    price: 249,
    type: "Deluxe",
    capacity: 2,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service", "Balcony", "Mountain View"],
    images: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
    ],
    floor: 6,
    roomNumber: "601",
    isAvailable: true
  },
  {
    title: "Standard Double Room",
    description: "Comfortable and well-appointed double room with modern amenities. Perfect for couples or business travelers seeking reliable accommodation.",
    price: 129,
    type: "Double",
    capacity: 2,
    amenities: ["WiFi", "TV", "AC"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800"
    ],
    floor: 1,
    roomNumber: "101",
    isAvailable: true
  },
  {
    title: "Premium Suite with Jacuzzi",
    description: "Indulge in luxury with this premium suite featuring a private jacuzzi, separate living area, and premium amenities. Perfect for special occasions.",
    price: 399,
    type: "Suite",
    capacity: 2,
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Room Service", "Kitchen", "Jacuzzi"],
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
    ],
    floor: 7,
    roomNumber: "701",
    isAvailable: true
  }
];

// Admin user data
const adminUser = {
  name: "Hotel Admin",
  email: "admin@hotel.com",
  password: "admin123",
  phone: "1234567890",
  role: "admin"
};

// Connect to MongoDB and seed data
const seedData = async () => {
  try {
    // Remove the direct mongoose.connect call
    // await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create(adminUser);
    console.log('Admin user created:', admin.email);

    // Create sample rooms
    const rooms = await Room.create(sampleRooms);
    console.log(`${rooms.length} sample rooms created`);

    console.log('Database seeded successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 