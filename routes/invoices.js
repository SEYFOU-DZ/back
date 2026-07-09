const express = require('express');
const Invoice = require('../models/Invoice');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/invoices
// @desc    Create a new invoice
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      requestId,
      invoiceNo,
      invoiceDate,
      customerName,
      customerPhone,
      vehicleType,
      vehicleCategory,
      trafficCode,
      feeDescription,
      feeAmount,
      feeNotes,
      notes1,
      notes2,
      items,
      subtotal,
      tax,
      total,
      notes,
      pdfUrl,
      qrCodeUrl
    } = req.body;

    const normalizedFeeAmount = Number(feeAmount ?? total ?? subtotal ?? 0);
    const normalizedSubtotal = Number(subtotal ?? normalizedFeeAmount);
    const normalizedTax = Number(tax ?? 0);
    const normalizedTotal = Number(total ?? normalizedSubtotal + normalizedTax);

    if (!invoiceNo || !invoiceDate || !customerName) {
      return res.status(400).json({ message: 'Missing required invoice data' });
    }

    if (!Number.isFinite(normalizedTotal) || normalizedTotal <= 0) {
      return res.status(400).json({ message: 'Invoice total must be greater than zero' });
    }

    const normalizedItems = Array.isArray(items) && items.length > 0
      ? items
      : [{
          description: feeDescription || 'Invoice fee',
          quantity: 1,
          price: normalizedFeeAmount || normalizedTotal,
          total: normalizedTotal
        }];

    const invoice = await Invoice.create({
      userId: req.user._id,
      requestId,
      invoiceNo,
      invoiceDate,
      customerName,
      customerPhone: customerPhone || '',
      vehicleType: vehicleType || '',
      vehicleCategory: vehicleCategory || '',
      trafficCode: trafficCode || '',
      feeDescription: feeDescription || '',
      feeAmount: Number.isFinite(normalizedFeeAmount) ? normalizedFeeAmount : normalizedTotal,
      feeNotes: feeNotes || '',
      notes1: notes1 || '',
      notes2: notes2 || '',
      items: normalizedItems,
      subtotal: normalizedSubtotal,
      tax: normalizedTax,
      total: normalizedTotal,
      notes,
      pdfUrl: pdfUrl || '',
      qrCodeUrl: qrCodeUrl || ''
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices
// @desc    Get all invoices for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .populate('requestId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices/all
// @desc    Get all invoices (admin only)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('userId', 'name email')
      .populate('requestId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('requestId');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user owns the invoice or is admin
    if (invoice.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user owns the invoice or is admin
    if (invoice.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user owns the invoice or is admin
    if (invoice.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    const updateFields = [
      'invoiceNo', 'invoiceDate', 'customerName', 'customerPhone',
      'vehicleType', 'vehicleCategory', 'trafficCode',
      'feeDescription', 'feeAmount', 'feeNotes',
      'notes1', 'notes2', 'notes', 'subtotal', 'tax', 'total', 'items'
    ];

    for (const field of updateFields) {
      if (field in req.body) {
        invoice[field] = req.body[field];
      }
    }

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
