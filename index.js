
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const multer = require('multer');
const path = require('path');
const config = require('./config');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Datastore Initialization
const users = Datastore.create('Users.db');
const userRefreshTokens = Datastore.create('UsersRefreshTokens.db');
const userInvalidTokens = Datastore.create('UserInvalidTokens.db');
const userClothingDb = Datastore.create('UserClothing.db');

// Middleware to Authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  try {
    const payload = jwt.verify(token, config.accessTokenSecret);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
// Registration Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    
    if (!email || !password || !userName) {
      return res.status(422).json({ message: 'Please fill in all fields (email, password, userName)' });
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ message: 'Invalid email format' });
    }

    
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await users.insert({
      userName,
      email,
      password: hashedPassword,
      role: role?.trim() || 'member', 
      '2faEnable': false,
      '2faSecret': null,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      id: newUser._id,
      userName,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(422).json({ message: 'Please fill in both fields (email, password)' });
      }
  
      const user = await users.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      const payload = {
        userId: user._id,
        email: user.email,
        userName: user.userName,
      };
  
      const accessToken = jwt.sign(payload, config.accessTokenSecret, { expiresIn: config.accessTokenExpiresIn });
  
      return res.status(200).json({
        message: 'Login successful',
        token: accessToken, // Token for frontend storage
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

// Logout Route 
app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
});

// upload ROute
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); 
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });

// Route to handle image uploads
app.post('/api/upload', upload.single('clothingImage'), async (req, res) => {
    console.log("Upload route hit");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
  
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Received token:", token);
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
  
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      console.log("Decoded token payload:", payload);
  
      const userId = payload.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
  
      const { category, type } = req.body;
  
      if (!category || !req.file) {
        return res.status(400).json({ message: 'Category and file are required.' });
      }
  
      const clothingItem = {
        userId,
        category,
        type,
        imagePath: req.file.filename,
        uploadedAt: new Date(),
      };
  
      await userClothingDb.insert(clothingItem);
      res.status(201).json({ message: 'Upload successful', clothingItem });
    } catch (error) {
      console.error('Error decoding token:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Route 
app.get('/api/closet', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      const userId = payload.userId;
  
      const clothingItems = await userClothingDb.find({ userId });
      res.status(200).json(clothingItems);
    } catch (error) {
      console.error('Error fetching clothing:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


  app.delete("/api/closet/:id", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Unauthorized" });
  
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
      const userId = payload.userId;
  
      const { id } = req.params;
      const item = await userClothingDb.findOne({ _id: id, userId });
      if (!item) {
        return res.status(404).json({ message: "Item not found." });
      }
  
      await userClothingDb.remove({ _id: id });
      res.status(200).json({ message: "Item deleted successfully." });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  app.post('/api/auth/refresh-token', async (req, res) =>{
    try {
    const { refreshToken } = req.body
    
    
    if (!refreshToken){
    return res.status(401).json({message: ' Refresh token not found'})
    }
    
    
    const decodedRefreshToken = jwt.verify(refreshToken, config.refreshTokenSecret)
    
    
    const userRefreshToken = await userRefreshTokens.findOne({refreshToken, userId: decodedRefreshToken.userId })
    if (!userRefreshToken){
    return res.status(401).json({ message: 'Refresh token invalid or expired'})
    }
    await userRefreshTokens.remove({ _id: userRefreshToken._id})
    await userRefreshTokens.compactDatafile()
    
    
    const accessToken = jwt.sign({ userId: decodedRefreshToken.userId }, config.accessTokenSecret, {subject: 'accessApi', expiresIn: config.accessTokenExpiresIn})
    
    
    const newRefreshToken = jwt.sign({ userId: decodedRefreshToken.userId}, config.refreshTokenSecret, {subject: 'refreshToken', expiresIn: config.refreshTokenExpiresIn })
    
    
    await userRefreshTokens.insert({
    refreshToken: newRefreshToken,
    userId: decodedRefreshToken.userId
    })
    return res.status(200).json({
    accessToken,
    refreshToken: newRefreshToken
    })
    
    
    } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError){
    return res.status(401).json({ message: 'Refresh token invalid or expired'})
    }
    return res.status(500).json({ message: error.message})
    }
    });


  //--------------------------------GAllery
  const galleryUploads = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/gallery');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const galleryUpload = multer({ storage: galleryUploads });
  
  app.post('/api/gallery/upload', galleryUpload.single('image'), (req, res) => {
    try {
      const { dateId } = req.body;
      if (!req.file || !dateId) {
        return res.status(400).json({ message: 'Image and dateId are required' });
      }
  
      res.status(201).json({ message: 'Upload successful', filePath: req.file.path });
    } catch (error) {
      console.error('Gallery upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));