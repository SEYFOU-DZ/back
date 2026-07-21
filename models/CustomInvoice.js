const mongoose = require('mongoose');

const customInvoiceItemSchema = new mongoose.Schema(
  {
    descriptionAr: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
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
    // Company Header snapshot
    companyHeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyHeader',
      default: null,
    },
    companyHeaderSnapshot: {
      companyName: { type: String, default: '' },
      addressLines: {
        type: [{ ar: String, en: String }],
        default: [],
      },
      logoUrl: { type: String, default: '' },
    },
    // Client Info
    clientName: { type: String, default: '' },
    clientPhone: { type: String, default: '' },
    clientEmail: { type: String, default: '' },
    clientAddress: { type: String, default: '' },
    // Invoice Dates
    invoiceDate: { type: String, required: true },
    dueDate: { type: String, default: '' },
    // Currency & Items
    currency: { type: String, default: 'SAR' },
    items: { type: [customInvoiceItemSchema], default: [] },
    // Totals
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 15 },
    taxAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    // Notes as a list of strings
    notes: { type: [String], default: [] },
    // PDF storage
    pdfUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CustomInvoice', customInvoiceSchema);
