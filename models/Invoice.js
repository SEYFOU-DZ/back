const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    description: String,
    quantity: Number,
    price: Number,
    total: Number,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
    },
    invoiceNo: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceDate: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleType: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleCategory: {
      type: String,
      trim: true,
      default: '',
    },
    trafficCode: {
      type: String,
      trim: true,
      default: '',
    },
    feeDescription: {
      type: String,
      trim: true,
      default: '',
    },
    feeAmount: {
      type: Number,
      default: 0,
    },
    feeNotes: {
      type: String,
      trim: true,
      default: '',
    },
    items: {
      type: [invoiceItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
