const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
});

exports.createOrder = async (req, res) => {
  const { amount,currency } = req.body;

  if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });
 if (!currency) return res.status(400).json({ success: false, message: 'Currency is required' });
  try {
    const options = {
      amount: amount * 100, // paise
      currency: currency,
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Could not create order', error: err.message });
  }
};

exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', razorpayInstance.key_secret)
    .update(sign.toString())
    .digest('hex');

  if (expectedSign === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature sent!' });
  }
};
