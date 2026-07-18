const express = require('express');
const CustomInvoice = require('../models/CustomInvoice');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/custom-invoices
// @desc    Create a new custom invoice
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      invoiceNo,
      invoiceDate,
      currency,
      logoUrl,
      items,
      taxRate,
      notes,
      signatureType,
      signatureData,
      language,
      companyName,
      companyAddress,
      pdfUrl
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const invoice = await CustomInvoice.create({
      userId: req.user._id,
      invoiceNo,
      invoiceDate,
      currency: currency || 'SAR',
      logoUrl: logoUrl || '',
      items: items.map(item => ({
        ...item,
        total: item.price * item.quantity
      })),
      subtotal,
      taxRate: taxRate || 15,
      taxAmount,
      total,
      notes: notes || [],
      signatureType: signatureType || 'manual',
      signatureData: signatureData || '',
      language: language || 'ar',
      companyName: companyName || '',
      companyAddress: companyAddress || '',
      pdfUrl: pdfUrl || '',
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/custom-invoices
// @desc    Get all custom invoices (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const invoices = await CustomInvoice.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/custom-invoices/:id
// @desc    Get single custom invoice
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const invoice = await CustomInvoice.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/custom-invoices/:id
// @desc    Delete custom invoice
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const invoice = await CustomInvoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
