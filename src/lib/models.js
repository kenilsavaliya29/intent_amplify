import mongoose from './db';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const AccountSchema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, unique: true, required: true },
    industry: { type: String, default: null },
    intentScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const ContactSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

const OpportunitySchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    name: { type: String, required: true },
    stage: {
      type: String,
      enum: ['NEW', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

const IntentSignalSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    signalType: { type: String, required: true },
    score: { type: Number, required: true },
    metadata: { type: Object, default: {} },
    occurredAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model('User', UserSchema);

export const Account =
  mongoose.models.Account || mongoose.model('Account', AccountSchema);

export const Contact =
  mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export const Opportunity =
  mongoose.models.Opportunity ||
  mongoose.model('Opportunity', OpportunitySchema);

export const IntentSignal =
  mongoose.models.IntentSignal ||
  mongoose.model('IntentSignal', IntentSignalSchema);


