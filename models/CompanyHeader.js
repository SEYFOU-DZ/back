const mongoose = require('mongoose');

const addressLineSchema = new mongoose.Schema(
  {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  { _id: false }
);

const companyHeaderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyNameAr: {
      type: String,
      trim: true,
      default: '',
    },
    companyNameEn: {
      type: String,
      trim: true,
      default: '',
    },
    addressLines: {
      type: [addressLineSchema],
      default: [],
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CompanyHeader', companyHeaderSchema);
