const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3 } = require("../utils/s3Client");
const { deleteImageFromS3 } = require('../utils/s3Helper');


const {
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../utils/fileHandler');

const getAllProducts = async (query) => {
  const { search, category, brand, minPrice, maxPrice, sort, order, page, limit } = query;

  const expressions = [];
  const attrNames = {};
  const attrValues = {};

  if (category) {
    expressions.push('#category = :category');
    attrNames['#category'] = 'category';
    attrValues[':category'] = category;
  }
  if (brand) {
    expressions.push('#brand = :brand');
    attrNames['#brand'] = 'brand';
    attrValues[':brand'] = brand;
  }
  if (minPrice) {
    expressions.push('#price >= :minPrice');
    attrNames['#price'] = 'price';
    attrValues[':minPrice'] = parseFloat(minPrice);
  }
  if (maxPrice) {
    expressions.push('#price <= :maxPrice');
    attrNames['#price'] = 'price';
    attrValues[':maxPrice'] = parseFloat(maxPrice);
  }

  const params = {
    TableName: TABLE_NAME,
    ...(expressions.length && {
      FilterExpression: expressions.join(' AND '),
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
    }),
  };

  const { Items = [] } = await docClient.send(new ScanCommand(params));

  let products = Items;

  if (search) {
    const term = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }

  if (sort) {
    switch (sort) {
      case 'priceAsc':
        products.sort((a, b) => a.price - b.price);
        break;

      case 'priceDesc':
        products.sort((a, b) => b.price - a.price);
        break;

      case 'latest':
        products.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;

      case 'oldest':
        products.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;

      case 'nameAsc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'nameDesc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;

      default:
        break;
    }
  }

  const total = products.length;
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const start = (currentPage - 1) * pageSize;
  const paginated = products.slice(start, start + pageSize);

  return {
    products: paginated,
    meta: { total, page: currentPage, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};

const getProductById = async (id) => {
  const { Item } = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { productId: id } }));
  return Item || null;
};

const createProduct = async (data) => {
  const product = {
    productId: uuidv4(),
    name: data.name,
    description: data.description,
    brand: data.brand,
    category: data.category,
    price: parseFloat(data.price),
    images: data.images || [],
    specifications: data.specifications || {},
    featured: data.featured || false,
    status: data.status || "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: product }));
  return product;
};

const updateProduct = async (id, data) => {
  const existing = await getProductById(id);
  if (!existing) return null;

  if (data.images && Array.isArray(data.images)) {

    const oldImages = existing.images || [];
    const newImages = data.images || [];

    const newKeys = newImages.map(image => image.key);

    const removedImages = oldImages.filter(
      image => !newKeys.includes(image.key)
    );

    for (const image of removedImages) {
      try {
        await deleteImageFromS3(image.key);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const immutable = ['productId', 'createdAt'];
  const stockFields = ['stock', 'currentStock', 'availableStock', 'reservedStock', 'quantity'];
  [...immutable, ...stockFields].forEach((key) => delete data[key]);

  if (data.price !== undefined) data.price = parseFloat(data.price);

  data.updatedAt = new Date().toISOString();

  const fields = Object.keys(data);
  const updateExpr = 'SET ' + fields.map((k) => `#${k} = :${k}`).join(', ');
  const attrNames = Object.fromEntries(fields.map((k) => [`#${k}`, k]));
  const attrValues = Object.fromEntries(fields.map((k) => [`:${k}`, data[k]]));

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { productId: id },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
      ReturnValues: 'ALL_NEW',
    })
  );
  return Attributes;
};

const getFeaturedProducts = async () => {
  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#featured = :featured AND #status = :status',
      ExpressionAttributeNames: {
        '#featured': 'featured',
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':featured': true,
        ':status': 'ACTIVE',
      },
    })
  );

  return Items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

const deleteProduct = async (id) => {
  // Step 1: Check if product exists
  const existing = await getProductById(id);

  if (!existing) return null;

  // Step 2: Delete all images from S3
  if (existing.images && existing.images.length > 0) {
    for (const image of existing.images) {
      if (image.key) {
        await deleteImageFromS3(image.key);
      }
    }
  }

  // Step 3: Delete product from DynamoDB
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        productId: id,
      },
    })
  );

  return existing;
};

const generateUploadUrl = async (fileName, contentType) => {
  const imageId = uuidv4();

  const extension = fileName.split(".").pop();

  const key = `products/${imageId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: 'image/*'
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300, // 5 minutes
  });

  const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    imageUrl,
    key,
  };
};

const path = require('path');

const generateUploadUrls = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('files array is required');
  }

  const uploads = [];

  for (const fileName of files) {
    const extension = path.extname(fileName);

    const key = `products/${uuidv4()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: 'image/*',
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    uploads.push({
      uploadUrl,
      imageUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      key,
    });
  }

  return {
    images: uploads,
  };
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts, generateUploadUrl, generateUploadUrls };
