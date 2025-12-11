import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an offer amount'],
      min: [0, 'Amount must be positive'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
offerSchema.index({ product: 1, status: 1 });
offerSchema.index({ buyer: 1 });
offerSchema.index({ createdAt: -1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;

