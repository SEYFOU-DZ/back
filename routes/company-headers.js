const express = require('express');
const CompanyHeader = require('../models/CompanyHeader');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/company-headers
// @desc    Get all company headers (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const headers = await CompanyHeader.find({}).sort({ createdAt: -1 });
    const mapped = headers.map(h => {
      const obj = h.toObject();
      if (!obj.companyName) {
        obj.companyName = obj.companyNameEn || obj.companyNameAr || obj.name || '';
      }
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/company-headers
// @desc    Create a new company header
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, companyName, addressLines, logoUrl } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required.' });
    }

    const header = await CompanyHeader.create({
      userId: req.user._id,
      name: name || companyName,
      companyName,
      addressLines: addressLines || [],
      logoUrl: logoUrl || '',
    });

    res.status(201).json(header);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/company-headers/:id
// @desc    Get single company header
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const header = await CompanyHeader.findById(req.params.id);
    if (!header) {
      return res.status(404).json({ message: 'Company header not found' });
    }
    const obj = header.toObject();
    if (!obj.companyName) {
      obj.companyName = obj.companyNameEn || obj.companyNameAr || obj.name || '';
    }
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/company-headers/:id
// @desc    Update a company header
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, companyName, addressLines, logoUrl } = req.body;

    const header = await CompanyHeader.findByIdAndUpdate(
      req.params.id,
      { name: name || companyName, companyName, addressLines, logoUrl },
      { new: true }
    );

    if (!header) {
      return res.status(404).json({ message: 'Company header not found' });
    }

    const obj = header.toObject();
    if (!obj.companyName) {
      obj.companyName = obj.companyNameEn || obj.companyNameAr || obj.name || '';
    }
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/company-headers/:id
// @desc    Delete a company header
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const header = await CompanyHeader.findById(req.params.id);
    if (!header) {
      return res.status(404).json({ message: 'Company header not found' });
    }
    await header.deleteOne();
    res.json({ message: 'Company header deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
