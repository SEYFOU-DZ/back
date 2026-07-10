const express = require('express');
const Request = require('../models/Request');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlate,
      quotationNo,
      description,
      pdfUrl,
      qrCodeUrl
    } = req.body;

    const request = await Request.create({
      userId: req.user._id,
      customerName,
      customerPhone,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlate,
      quotationNo,
      description,
      pdfUrl,
      qrCodeUrl,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests
// @desc    Get all requests for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/all
// @desc    Get all requests (admin only)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/notifications
// @desc    Get all decision notifications for current user (read and unread)
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Request.find({
      userId: req.user._id,
      status: { $in: ['accepted', 'rejected'] },
      adminMessage: { $ne: '' },
    })
      .sort({ decisionDate: -1, createdAt: -1 })
      .select('customerName status adminMessage decisionDate messageSeenAt');

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id/message-seen
// @desc    Mark a decision message as seen by the user
// @access  Private
router.put('/:id/message-seen', protect, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.messageSeenAt = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns the request or is admin
    if (request.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id/status
// @desc    Update request status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, adminMessage } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const update = {
      status,
      adminMessage: typeof adminMessage === 'string' ? adminMessage.trim() : '',
      decisionDate: status === 'pending' ? null : new Date(),
      messageSeenAt: null,
    };

    if (!update.adminMessage) {
      update.adminMessage = status === 'accepted'
        ? 'Your request has been accepted successfully.'
        : 'Your request has been rejected. Please contact support for more details.';
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns the request or is admin
    if (request.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
