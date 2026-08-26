import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    available: { type: Boolean, default: true },
    source: { type: String, enum: ['manual', 'placeholder', 'blink-import'], default: 'manual' },
    sourceItemId: { type: String, default: null },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
