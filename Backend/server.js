require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const logger = require("./utils/logger");
const { errorHandler } = require("./middleware/errorHandler");
// Ensure database structure is ready when the server starts
require("./initDb");
const { authenticateToken } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const opdRoutes = require("./routes/opdRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Test simple route
app.get('/testapi', (req, res) => {
  console.log('Test route called');
  res.send('Test route working');
});

// Debug route listing
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
      routes.push({ path: middleware.route.path, methods });
    } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
          routes.push({ path: middleware.regexp.source.replace('^\\','').replace('\\/?(?=\/|$)','') + handler.route.path, methods });
        }
      });
    }
  });
  res.json(routes);
});

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount department routes
app.use('/api/departments', departmentRoutes);

// Mount OPD routes
app.use('/api/opd', opdRoutes);


// Log registered routes (for debugging)
const routerStack = (app._router || app.router)?.stack;
console.log('Registered routes:');
if (!routerStack) {
  console.log('  (no router stack found on app)');
} else {
  routerStack
    .filter((layer) => layer.route)
    .forEach((layer) => {
      const methods = Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(',');
      console.log(`  ${methods} ${layer.route.path}`);
    });
}

app.get("/", (req, res) => {
  res.send("PulseQueue Backend Running");
});

// TEST DATABASE API
app.get("/test-db", (req, res) => {

  db.query("SELECT 1 + 1 AS result", (err, results) => {

    if (err) {
      return res.status(500).send(err);
    }

    res.json(results);

  });

});

// GET PATIENTS API
app.get("/api/patients", (req, res) => {
  db.query("SELECT * FROM patients", (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Error handling middleware (must be after all routes and middleware)
app.use(errorHandler);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


