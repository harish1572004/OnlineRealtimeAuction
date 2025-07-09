const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

mongoose.connect('mongodb://127.0.0.1:27017/biddingSystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'));

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  userId: String,
  password: String,
  purchases: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    amount: Number,
    date: Date
  }]
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: String,
  basePrice: Number,
  addedBy: String,
  currentBid: Number,
  currentBidder: String,
  sold: { type: Boolean, default: false }
});
const Product = mongoose.model('Product', productSchema);

app.post('/api/login', async (req, res) => {
  const { userId, password } = req.body;
  let user = await User.findOne({ userId });
  if (!user) user = await User.create({ userId, password });
  else if (user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ user });
});

app.post('/api/products', async (req, res) => {
  const { name, basePrice, addedBy } = req.body;
  const pr = await Product.create({ name, basePrice, addedBy });
  res.json(pr);
});

app.get('/api/products', async (req, res) => {
  res.json(await Product.find());
});

app.get('/api/products/sold/:addedBy', async (req, res) => {
  res.json(await Product.find({ addedBy: req.params.addedBy, sold: true }));
});

app.get('/api/products/:id', async (req, res) => {
  const pr = await Product.findById(req.params.id);
  if (!pr) return res.status(404).json({ message: 'Not found' });
  res.json(pr);
});

app.post('/api/checkout', async (req, res) => {
  const { userId, productId, bid } = req.body;
  const user = await User.findById(userId);
  const pr = await Product.findById(productId);
  if (!user || !pr || !pr.sold || pr.currentBidder !== userId)
    return res.status(403).json({ message: 'Not allowed' });

  user.purchases.push({ product: pr._id, amount: bid, date: new Date() });
  await user.save();
  res.json({ success: true });
});

io.on('connection', socket => {
  socket.on('joinAuction', ({ productId }) => {
    socket.join(productId);
  });

  socket.on('bid', async ({ productId, userId, bid }) => {
    const pr = await Product.findById(productId);
    if (!pr || pr.sold) return;
    const current = pr.currentBid ?? pr.basePrice;
    if (bid > current) {
      pr.currentBid = bid;
      pr.currentBidder = userId;
      await pr.save();
      io.to(productId).emit('newBid', { bid, userId });
    }
  });

  socket.on('finishAuction', async ({ productId }) => {
    const pr = await Product.findById(productId);
    if (!pr || pr.sold) return;
    pr.sold = true;
    await pr.save();
    io.to(productId).emit('auctionEnded', {
      soldTo: pr.currentBidder,
      finalBid: pr.currentBid ?? pr.basePrice
    });
  });
});
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find().populate('purchases.product');
  res.json(users);
});

app.get('/api/admin/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});


server.listen(5000, () => console.log('🚀 Server running at http://localhost:5000'));
