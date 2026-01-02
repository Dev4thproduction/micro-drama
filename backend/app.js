const express = require('express');
const cors = require('cors');
const config = require('./src/config/env');
const healthRoutes = require('./src/routes/health.routes');
const authRoutes = require('./src/routes/auth.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const creatorRoutes = require('./src/routes/creator.routes');
const videoRoutes = require('./src/routes/video.routes');
const adminRoutes = require('./src/routes/admin.routes');
const contentRoutes = require('./src/routes/content.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const errorHandler = require('./src/middleware/errorHandler');
const requestLogger = require('./src/middleware/requestLogger');
const browseRoutes = require('./src/routes/browse.routes');
const app = express();

const corsOptions = {
  origin: config.corsOrigins.includes('*') ? '*' : config.corsOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

// ✅ CHANGE THIS LINE (remove the 's')
app.use('/upload', uploadRoutes); 

app.use('/creator', creatorRoutes);
app.use('/video', videoRoutes);
app.use('/admin', adminRoutes);
app.use('/content', contentRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/browse', browseRoutes);
app.use('/uploads', uploadRoutes);
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;