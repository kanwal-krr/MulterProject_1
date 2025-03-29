const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Configure multer for different file types
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Determine folder based on file type
        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        } else if (file.mimetype.startsWith('video/')) {
            uploadPath += 'videos/';
        } else if (file.mimetype === 'application/pdf') {
            uploadPath += 'documents/';
        } else {
            uploadPath += 'others/';
        }
        
        // Create directory if it doesn't exist
        require('fs').mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedTypes = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'video/mp4': '.mp4',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
    };

    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed types: JPG, PNG, GIF, MP4, PDF, DOC, DOCX'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        res.send(`File uploaded successfully. <a href="${req.file.path}">View File</a>`);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File size is too large. Max size is 10MB');
        }
    }
    res.status(500).send(error.message);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});