const express = require('express');
const app = express();
const opdRoutes = require('./routes/opdRoutes');
app.use('/api/opd', opdRoutes);

const sub = app._router.stack.find(layer => layer.name === 'router');
console.log('sub', !!sub);
if (sub && sub.handle && sub.handle.stack) {
  console.log(sub.handle.stack.filter(l => l.route).map(l => ({ path: l.route.path, methods: Object.keys(l.route.methods) })));
}
