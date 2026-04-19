import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/realestatecrm';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@crm.com' });
    
    if (!adminExists) {
      // Create admin user
      const admin = new User({
        name: 'Admin User',
        email: 'admin@crm.com',
        password: 'password123',
        role: 'admin',
        phone: '1234567890'
      });
      await admin.save();
      console.log('Admin user created: admin@crm.com / password123');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create a manager
    const managerExists = await User.findOne({ email: 'manager@crm.com' });
    if (!managerExists) {
      const manager = new User({
        name: 'Manager User',
        email: 'manager@crm.com',
        password: 'password123',
        role: 'manager',
        phone: '1234567891'
      });
      await manager.save();
      console.log('Manager user created: manager@crm.com / password123');
    }
    
    // Create an agent
    const agentExists = await User.findOne({ email: 'agent@crm.com' });
    if (!agentExists) {
      const agent = new User({
        name: 'Agent User',
        email: 'agent@crm.com',
        password: 'password123',
        role: 'agent',
        phone: '1234567892'
      });
      await agent.save();
      console.log('Agent user created: agent@crm.com / password123');
    }
    
    console.log('Seed completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });