const express = require('express');
const CustomInvoice = require('../models/CustomInvoice');
const CompanyHeader = require('../models/CompanyHeader');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/custom-invoices
// @desc    Create a new custom invoice
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      invoiceNo,
      companyHeaderId,
      clientName,
      clientPhone,
      clientEmail,
      clientAddress,
      invoiceDate,
      dueDate,
      currency,
      items,
      taxRate,
      discount,
      notes,
      pdfUrl,
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountAmount = discount || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * (taxRate || 15)) / 100;
    const total = taxableAmount + taxAmount;

    // Fetch and snapshot the company header
    let companyHeaderSnapshot = {
      companyName: '',
      addressLines: [],
      logoUrl: '',
    };

    if (companyHeaderId) {
      const header = await CompanyHeader.findById(companyHeaderId);
      if (header) {
        companyHeaderSnapshot = {
          companyName: header.companyName || header.companyNameEn || header.companyNameAr || header.name || '',
          addressLines: header.addressLines,
          logoUrl: header.logoUrl,
        };
      }
    }

    const invoice = await CustomInvoice.create({
      userId: req.user._id,
      invoiceNo,
      companyHeaderId: companyHeaderId || null,
      companyHeaderSnapshot,
      clientName: clientName || '',
      clientPhone: clientPhone || '',
      clientEmail: clientEmail || '',
      clientAddress: clientAddress || '',
      invoiceDate,
      dueDate: dueDate || '',
      currency: currency || 'SAR',
      items: items.map(item => ({
        descriptionAr: item.descriptionAr || '',
        descriptionEn: item.descriptionEn || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity,
      })),
      subtotal,
      taxRate: taxRate || 15,
      taxAmount,
      discount: discountAmount,
      total,
      notes: notes || [],
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
