const {
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const path = require("path");
const { v4: uuidv4 } = require("uuid");

const {
  s3,
  DeleteObjectCommand,
} = require("./s3Client");

const BUCKET = process.env.S3_BUCKET_NAME;

// Delete image
const deleteImageFromS3 = async (key) => {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
};

// Generate upload URL
const generateUploadUrl = async (
  fileName,
  contentType,
  folder = "products"
) => {
  const extension = path.extname(fileName);

  const key = `${folder}/${uuidv4()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 300,
    }
  );

  const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    imageUrl,
    key,
  };
};

module.exports = {
  deleteImageFromS3,
  generateUploadUrl,
};