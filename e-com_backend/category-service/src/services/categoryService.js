const { v4: uuidv4 } = require('uuid');

const {
  PutCommand,
  ScanCommand,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');

const {
  docClient,
  TABLE_NAME,
} = require('../utils/fileHandler');

const createCategory = async (data) => {

  const category = {
    categoryId: uuidv4(),
    name: data.name,
    description: data.description || '',
    image: data.image || {},
    featured: data.featured || false,
    status: data.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: category,
    })
  );

  return category;

};

const getAllCategories = async (query) => {
  const {
    search,
    status,
    featured,
    sortBy,
    order,
    page,
    limit,
  } = query;

  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  let categories = Items;

  // Search
  if (search) {
    const term = search.toLowerCase();

    categories = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }

  // Status Filter
  if (status) {
    categories = categories.filter(
      (c) => c.status === status
    );
  }

  // Featured Filter
  if (featured !== undefined) {
    const isFeatured = featured === "true";

    categories = categories.filter(
      (c) => c.featured === isFeatured
    );
  }

  // Sorting
  if (sortBy) {
    const dir = order === "desc" ? -1 : 1;

    categories.sort((a, b) => {
      if (typeof a[sortBy] === "string") {
        return (
          a[sortBy].localeCompare(b[sortBy]) * dir
        );
      }

      return (a[sortBy] - b[sortBy]) * dir;
    });
  }

  // Pagination
  const total = categories.length;

  const currentPage = parseInt(page) || 1;

  const pageSize = parseInt(limit) || 10;

  const start = (currentPage - 1) * pageSize;

  const paginated = categories.slice(
    start,
    start + pageSize
  );

  return {
    categories: paginated,

    meta: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getCategoryById = async (id) => {
  const { Item } = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        categoryId: id,
      },
    })
  );

  return Item || null;
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById
};