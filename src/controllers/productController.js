import cloudinary, { uploadImages } from "../lib/cloudinary.js";
import prisma from "../lib/prismaClient.js";
import fs from "fs";

const uploadProducts = async (req, res) => {
  try {
    const {
      title,
      description,
      retailPrice,
      salePrice,
      quantity = 10,
    } = req.body;
    if (!title || !(retailPrice || salePrice)) {
      return res.send("Product related data required");
    }
    if (!req.files && !Array.isArray(req.files)) {
      return res.send("Images are required");
    }

    const isExist = await prisma.product.findFirst({
      where: {
        title,
      },
    });

    if (isExist) {
      return res.send("Product already exists");
    }

    const uploadedImages = [];
    for (const file of req.files) {
      try {
        const uploadedUrl = await uploadImages(file);
        uploadedImages.push(uploadedUrl);

        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("Error deleting file:", file.path, err);
          } else {
            console.log("File deleted:", file.path);
          }
        });
      } catch (error) {
        console.error("Upload failed for file:", file.originalname, error);
      }
    }
    console.log("uploaded images", uploadedImages);

    console.log("admin user", req.user);
    const createdProduct = await prisma.product.create({
      data: {
        user_id: req.user.id,
        description,
        title,
        retailPrice: parseFloat(retailPrice),
        salePrice: parseFloat(salePrice) || parseFloat(retailPrice),
        quantity,
        images: {
          create: uploadedImages.map((image) => ({
            url: image,
          })),
        },
      },
    });

    console.log("product created", createdProduct);
    return res.json({ message: "product uploaded", createdProduct });
  } catch (err) {
    console.log("error", err);
    return res.send("Error occured while uploading image");
  }
};

const getProducts = async (req, res) => {
  try {
    const fetchedProducts = await prisma.product.findMany({
      select: {
        title: true,
        description: true,
        retailPrice: true,
        salePrice: true,
        quantity: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    });
    res.json(fetchedProducts);
  } catch (err) {
    console.log("error", err);
    return res.send(err.message);
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({message: 'Product not found'})
    }
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,  // Fetch associated images to delete from Cloudinary
      },
    });

    // If product does not exist
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      try {
        // Extract public_id from the image URL to delete it from Cloudinary
        const publicId = image.url.split('/').pop().split('.')[0]; // Adjust if necessary based on URL format
        console.log('publicID', publicId)
        await cloudinary.uploader.destroy(publicId);
        console.log(`Image deleted from Cloudinary: ${image.url}`);
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", image.url, error);
      }
    }

    // Delete the product from the database, which will also delete associated images due to cascade
    await prisma.product.delete({
      where: { id: parseInt(id) },
      include: {
        images: true
      }
    });

    return res.json({ message: "Product and associated images deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: "Error occurred while deleting the product" });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({message: "Product not found"})
    }
    const { title, description, retailPrice, salePrice, quantity } = req.body;

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Store URLs of new images if they are provided
    const newUploadedImages = [];
    if (req.files && Array.isArray(req.files)) {
      // Delete old images from Cloudinary if new images are uploaded
      for (const image of product.images) {
        try {
          const publicId = image.url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${image.url}`);
        } catch (error) {
          console.error("Failed to delete image from Cloudinary:", image.url, error);
        }
      }

      // Delete old images from the database
      await prisma.image.deleteMany({
        where: { product_id: product.id },
      });

      // Upload new images to Cloudinary
      for (const file of req.files) {
        try {
          const uploadedUrl = await uploadImages(file);
          newUploadedImages.push(uploadedUrl);

          // Remove uploaded file from server
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error("Error deleting file:", file.path, err);
            } else {
              console.log("File deleted:", file.path);
            }
          });
        } catch (error) {
          console.error("Upload failed for file:", file.originalname, error);
        }
      }
    }

    // Update the product in the database
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title: title || product.title,
        description: description || product.description,
        retailPrice: retailPrice ? parseFloat(retailPrice) : product.retailPrice,
        salePrice: salePrice ? parseFloat(salePrice) : product.salePrice,
        quantity: quantity || product.quantity,
        images: {
          create: newUploadedImages.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    console.log("Product updated:", updatedProduct);
    return res.json({ message: "Product updated successfully", updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: "Error occurred while updating the product" });
  }
};


export { uploadProducts, getProducts,deleteProduct, updateProduct };
