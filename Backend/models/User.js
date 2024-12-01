const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create a new user in the database
    static async create({ name, email, phone, password }) {
        const connection = await pool.getConnection();
        
        try {
            // Start transaction for data consistency
            await connection.beginTransaction();

            // First check if user already exists with this email or phone
            const [existingUsers] = await connection.execute(
                'SELECT email, phone FROM users WHERE email = ? OR phone = ?',
                [email, phone]
            );

            if (existingUsers.length > 0) {
                // Determine which field(s) are duplicated
                const duplicateFields = [];
                existingUsers.forEach(user => {
                    if (user.email === email) duplicateFields.push('email');
                    if (user.phone === phone) duplicateFields.push('phone');
                });
                
                throw new Error(`User already exists with this ${duplicateFields.join(' and ')}`);
            }

            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user
            const [result] = await connection.execute(
                `INSERT INTO users (name, email, phone, password) 
                 VALUES (?, ?, ?, ?)`,
                [name, email, phone, hashedPassword]
            );

            await connection.commit();
            
            // Return user data without password
            return {
                id: result.insertId,
                name,
                email,
                phone
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async verifyCredentials(email, password) {
        try {
            // Get user with password for verification
            const [rows] = await pool.execute(
                'SELECT id, name, email, phone, password FROM users WHERE email = ?',
                [email]
            );

            const user = rows[0];

            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            // Return user data without password
            const { password: _, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                role: 'user' // Add default role for regular users
            };
        } catch (error) {
            throw error;
        }
    }

    // Helper method to find user by email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }
}

module.exports = User;