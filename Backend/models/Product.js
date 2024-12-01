const { pool } = require("../config/database");

class Product {
  static async addProducts(products) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const insertPromises = products.map((product) => {
        const { name, authors, price, description, image_url, stock } = product;
        return connection.execute(
          `INSERT INTO products (name, authors, price, description, image_url, stock)
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [
            name,
            authors,
            price,
            description || null,
            image_url || null,
            stock || 0,
          ]
        );
      });

      const results = await Promise.all(insertPromises);
      await connection.commit();

      // Return array of inserted IDs and their corresponding data
      return results.map(([result], index) => ({
        id: result.insertId,
        ...products[index],
      }));
    } catch (error) {
      await connection.rollback();
      console.error("Error adding products:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getProducts(page = 1, limit = 50) {
    const connection = await pool.getConnection();

    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get total count of products
      const [countResult] = await connection.execute(
        "SELECT COUNT(*) as total FROM products"
      );
      const totalProducts = countResult[0].total;

      // Calculate total pages
      const totalPages = Math.ceil(totalProducts / limit);

      // Get products for current page
      const [products] = await connection.execute(
        `SELECT id, name, authors, price, description, image_url, stock 
                 FROM products 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return {
        products,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async searchProducts(searchQuery, page = 1, limit = 50) {
    const connection = await pool.getConnection();

    try {
      const offset = (page - 1) * limit;
      const searchTerm = `%${searchQuery}%`;

      // Get total count of matched products
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total 
                 FROM products 
                 WHERE name LIKE ? OR authors LIKE ? OR description LIKE ?`,
        [searchTerm, searchTerm, searchTerm]
      );
      const totalProducts = countResult[0].total;
      const totalPages = Math.ceil(totalProducts / limit);

      // Get matched products for current page
      const [products] = await connection.execute(
        `SELECT id, name, authors, price, description, image_url, stock 
                 FROM products 
                 WHERE name LIKE ? OR authors LIKE ? OR description LIKE ?
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`,
        [searchTerm, searchTerm, searchTerm, limit, offset]
      );

      return {
        products,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getById(productId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, authors, price, description, image_url, stock, 
                    created_at, updated_at
             FROM products 
             WHERE id = ?`,
        [productId]
      );

      return rows[0]; // Return the first (and should be only) result
    } catch (error) {
      console.error("Error getting product by ID:", error);
      throw error;
    }
  }
}

module.exports = Product;
