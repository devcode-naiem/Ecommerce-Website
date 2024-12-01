const Product = require("../models/Product");

class ProductController {
  static async addProducts(req, res) {
    try {
      // Products array is guaranteed by validator middleware
      const productsToAdd = req.body;

      // Add products to database
      const addedProducts = await Product.addProducts(productsToAdd);

      // Prepare response based on number of products added
      const isSingleProduct = productsToAdd.length === 1;

      res.status(201).json({
        success: true,
        message: isSingleProduct
          ? "Product added successfully"
          : `${addedProducts.length} products added successfully`,
        data: isSingleProduct ? addedProducts[0] : addedProducts,
      });
    } catch (error) {
      console.error("Error in addProducts controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add product(s)",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
  static async getProducts(req, res) {
    try {
      // Extract query parameters with defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const search = req.query.search?.trim();

      // Get products based on whether there's a search query
      const result = search
        ? await Product.searchProducts(search, page, limit)
        : await Product.getProducts(page, limit);

      // Format product prices and add metadata

      console.log(result.products)
      const formattedProducts = result.products.map((product) => ({
        ...product,
        price: parseFloat(product.price),
        isInStock: product.stock > 0,
      }));

      res.json({
        success: true,
        message: search ? "Products found" : "Products retrieved successfully",
        data: {
          products: formattedProducts,
          pagination: {
            ...result.pagination,
            // Add helpful URLs for frontend
            nextPage: result.pagination.hasNextPage
              ? `/api/products?page=${page + 1}&limit=${limit}${
                  search ? `&search=${search}` : ""
                }`
              : null,
            prevPage: result.pagination.hasPrevPage
              ? `/api/products?page=${page - 1}&limit=${limit}${
                  search ? `&search=${search}` : ""
                }`
              : null,
          },
        },
      });
    } catch (error) {
      console.error("Error in getProducts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = ProductController;
