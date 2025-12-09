// Load environment variables from .env file
// Make sure MONGODB_URI and JWT_SECRET are set in your .env file
import { connectToDatabase } from '../../lib/db.js';
import { User } from '../../lib/models.js';
import { hashPassword } from '../../lib/auth.js';

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database.');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail }).exec();
    
    if (existingUser) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      console.log('Skipping creation.');
      process.exit(0);
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(adminPassword);

    // Create the admin user
    console.log('Creating admin user...');
    const adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${adminUser.email}`);
    console.log(`ID: ${adminUser._id}`);
    console.log('\nYou can now login with:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();

