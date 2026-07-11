const { s3, DeleteObjectCommand } = require("./s3Client");

const deleteImageFromS3 = async (key) => {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })
  );
};

module.exports = {
  deleteImageFromS3,
};