const db = require('../models/index');
const hashHelper = require('../helpers/password-helper');

async function initDatabase() {
    try {
        console.log('Starting database initialization...');

        // Sync database (create tables if they don't exist)
        await db.sequelize.sync({ force: false });
        console.log('Database synced');

        // Check if admin role already exists
        let adminRole = await db.Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = await db.Role.create({ name: 'admin' });
            console.log('Admin role created');
        } else {
            console.log('Admin role already exists');
        }

        // Check if admin user already exists
        let adminUser = await db.User.findOne({ 
            where: { emailAddress: 'admin@example.com' } 
        });
        
        if (!adminUser) {
            adminUser = await db.User.create({
                firstName: 'Admin',
                lastName: 'User',
                emailAddress: 'admin@example.com',
                password: hashHelper.hashPass('admin123')
            });
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }

        // Assign admin role to admin user
        await adminUser.addRole(adminRole);
        console.log('Admin role assigned to admin user');

        // Create categories
        const categories = [
            { name: 'Laptop' },
            { name: 'Keyboard' },
            { name: 'Mousepad' },
        ];

        const createdCategories = [];
        for (const categoryData of categories) {
            let category = await db.Category.findOne({ where: { name: categoryData.name } });
            if (!category) {
                category = await db.Category.create(categoryData);
                console.log(`Category created: ${category.name}`);
            } else {
                console.log(`Category already exists: ${category.name}`);
            }
            createdCategories.push(category);
        }

        // Create products
        const products = [
            {
                name: 'Laptop Pro',
                description: 'High-performance laptop with 16GB RAM and 512GB SSD. Perfect for professionals and developers.',
                price: 1299.99,
                stock: 50,
                CategoryId: createdCategories[0].id, // Laptop
                images: [
                    { link: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500' }
                ]
            },
            {
                name: 'Pc portable gamer',
                description: 'PC portable gamer haute performances 17 pouces',
                price: 2500,
                stock: 100,
                CategoryId: createdCategories[0].id, // Laptop
                images: [
                    { link: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6319/6319980_rd.jpg' }
                ]
            },
            {
                name: 'Clavier 75%',
                description: 'Clavier 75% leger noir mate parfait pour être déplacer n\'importe ou',
                price: 120,
                stock: 75,
                CategoryId: createdCategories[1].id, // Keyboard
                images: [
                    { link: 'https://cdn.dribbble.com/userupload/16046071/file/original-2cc45fe1710ad6050620b99d356e0db2.png?resize=1024x768&vertical=center' }
                ]
            },
            {
                name: 'Clavier RGB avec pavé num',
                description: 'Clavier RGB avec pavé numérique et mécanique avec un sons fin est silencieux',
                price: 75,
                stock: 200,
                CategoryId: createdCategories[1].id, // Keyboard
                images: [
                    { link: 'https://i.pinimg.com/736x/4e/7d/44/4e7d440d4f61f5d005ab51973ec0c9e7.jpg' }
                ]
            },
            {
                name: 'Tapis de souris Soul eater',
                description: 'Tapis de souris sur le thème Soul eater, venez faucher les ames de vos adversaires',
                price: 59.99,
                stock: 150,
                CategoryId: createdCategories[2].id, // Mousepad
                images: [
                    { link: 'https://i.pinimg.com/736x/b7/c8/5c/b7c85c723bd254edc49a5589048ddf80.jpg' }
                ]
            },
            {
                name: 'Tapis de Souris Geforce',
                description: 'Tapis de souris large L fibre ultra lisse parfaite pour les longues session de jeu',
                price: 69.99,
                stock: 80,
                CategoryId: createdCategories[2].id, // Mousepad
                images: [
                    { link: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500' }
                ]
            },
        ];

        for (const productData of products) {
            // Check if product already exists
            let product = await db.Product.findOne({ 
                where: { name: productData.name } 
            });

            if (!product) {
                // Extract images before creating product
                const { images, ...productInfo } = productData;
                
                // Create product
                product = await db.Product.create(productInfo);
                console.log(`Product created: ${product.name}`);

                // Create images for the product
                if (images && images.length > 0) {
                    for (const imageData of images) {
                        await db.Image.create({
                            ...imageData,
                            ProductId: product.id
                        });
                    }
                    console.log(`  - Added ${images.length} image(s)`);
                }
            } else {
                console.log(`Product already exists: ${product.name}`);
            }
        }

        console.log('\n✅ Database initialization completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - Admin user: admin@example.com');
        console.log('   - Admin password: admin123');
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - Products: ${products.length}`);

        // Close the database connection
        await db.sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        await db.sequelize.close();
        process.exit(1);
    }
}

// Run the initialization
initDatabase();