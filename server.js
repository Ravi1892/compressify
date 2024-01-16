const express = require("express");
const sharp = require("sharp");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));

// ... (existing code)

app.post('/resize', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const sizeLimit = parseInt(req.query.sizeLimit) || 100;
  const [width, height] = [600, 400];
  const maxSize = sizeLimit * 1000; // Convert KB to bytes

  const originalFileName = req.query.originalFileName || 'resized_image';  // Default to 'resized_image' if original filename is not provided
  const extIndex = originalFileName.lastIndexOf('.');
  const fileNameWithoutExtension = extIndex !== -1 ? originalFileName.substring(0, extIndex) : originalFileName;
  const fileExtension = extIndex !== -1 ? originalFileName.substring(extIndex) : '';

  const imageBuffer = req.file.buffer;

  // Attempt to resize the image
  try {
    let quality = 100;
    let resizedImageBuffer = await sharp(imageBuffer)
      .resize({ width, height, fit: 'inside' })
      .jpeg({ quality })
      .toBuffer();

    // Compress the image iteratively until it fits within the limit
    while (resizedImageBuffer.length > maxSize && quality >= 10) {
      quality -= 1;
      resizedImageBuffer = await sharp(imageBuffer)
        .resize({ width, height, fit: 'inside' })
        .jpeg({ quality })
        .toBuffer();
    }

    // Check if the final resized image size exceeds the limit
    if (resizedImageBuffer.length > maxSize) {
      return res.status(400).send(`Resized image size still exceeds the limit of ${sizeLimit}KB after compression.`);
    }

    const resizedFileName = `${fileNameWithoutExtension}_resized${fileExtension}`;
    res.set({
      'Content-Disposition': `attachment; filename="${resizedFileName}"`,
      'Content-Type': 'image/jpeg',
    }).send(resizedImageBuffer);
  } catch (error) {
    console.error('Error resizing image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ... (existing code)


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
