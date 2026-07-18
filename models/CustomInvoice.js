const mongoose = require('mongoose');

const customInvoiceItemSchema = new mongoose.Schema(
  {
    description: String,
    quantity: Number,
    price: Number,
    total: Number,
  },
  { _id: false }
);

const customInvoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    currency: {
      type: String,
      default: 'SAR',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    items: {
      type: [customInvoiceItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 15,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: {
      type: [String],
      default: [],
    },
    signatureType: {
      type: String,
      enum: ['manual', 'image'],
      default: 'manual',
    },
    signatureData: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    companyAddress: {
      type: String,
      trim: true,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CustomInvoice', customInvoiceSchema);
