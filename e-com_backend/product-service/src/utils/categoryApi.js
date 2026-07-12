const axios = require("axios");

const CATEGORY_SERVICE_URL = process.env.CATEGORY_SERVICE_URL;

const getCategory = async (categoryId) => {
  console.log("CATEGORY_SERVICE_URL:", CATEGORY_SERVICE_URL);
  console.log("Category ID:", categoryId);

  try {
    const response = await axios.get(
      `${CATEGORY_SERVICE_URL}/${categoryId}`,
      {
        timeout: 5000,
      }
    );

    console.log("Category response:", response.data);

    return response.data.data;
  } catch (err) {
    console.error("Axios error:", err.code);
    console.error("Axios message:", err.message);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Body:", err.response.data);
    }

    throw err;
  }
};

module.exports = { getCategory };   