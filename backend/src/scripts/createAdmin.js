// Script to create test users for all roles
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully\n');

        const users = [
            {
                name: 'Admin User',
                email: 'admin@luxe.com',
                password: 'Admin123!',
                role: 'admin',
                phoneNumber: '+1234567890'
            },
            {
                name: 'Test Customer',
                email: 'customer@test.com',
                password: 'Customer123!',
                role: 'customer',
                phoneNumber: '+1234567891'
            },
            {
                name: 'Test Designer',
                email: 'designer@test.com',
                password: 'Designer123!',
                role: 'designer',
                phoneNumber: '+1234567892',
                bio: 'Experienced fashion designer specializing in evening wear',
                specialties: JSON.stringify(['Evening Wear', 'Bridal', 'Custom Tailoring'])
            }
        ];

        for (const userData of users) {
            let user = await User.findOne({ where: { email: userData.email } });

            if (user) {
                user.role = userData.role;
                user.passwordHash = await bcrypt.hash(userData.password, 10);
                await user.save();
                console.log(`✓ Updated ${userData.email} to ${userData.role} and reset password`);
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                // Remove plaintext password from userData before creating
                const { password, ...userFields } = userData;
                await User.create({
                    ...userFields,
                    passwordHash: hashedPassword
                });
                console.log(`✓ Created ${userData.email} as ${userData.role}`);
            }
        }

        console.log('\n📧 Test Accounts Created:\n');
        console.log('👔 Admin:');
        console.log('   Email: admin@luxe.com');
        console.log('   Password: Admin123!\n');

        console.log('🛍️  Customer:');
        console.log('   Email: customer@test.com');
        console.log('   Password: Customer123!\n');

        console.log('🎨 Designer:');
        console.log('   Email: designer@test.com');
        console.log('   Password: Designer123!\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUsers();
