import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// MongoDB connection handling
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

const getDatabase = async (): Promise<Db> => {
  if (mongoDb) return mongoDb;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timecapsule';
  // Allow database name inside URI or fallback
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  // If URI includes db, driver selects it; else default
  mongoDb = mongoClient.db();
  await ensureIndexes(mongoDb);
  return mongoDb;
};

const ensureIndexes = async (db: Db) => {
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true, name: 'uniq_email' },
    { key: { provider: 1, providerId: 1 }, unique: true, name: 'uniq_provider_providerId' },
  ]);
  await db.collection('payments').createIndexes([
    { key: { stripePaymentIntentId: 1 }, unique: true, name: 'uniq_payment_intent' },
    { key: { userId: 1, createdAt: -1 }, name: 'user_payments_by_date' },
  ]);
  await db.collection('timeCapsules').createIndexes([
    { key: { userId: 1, deliveryDate: 1 }, name: 'user_capsules_by_delivery' },
    { key: { isDelivered: 1, deliveryDate: 1 }, name: 'delivery_queue' },
  ]);
  await db.collection('userSettings').createIndexes([
    { key: { userId: 1 }, unique: true, name: 'uniq_user_settings' },
  ]);
};

const generateId = () => new ObjectId().toString();

// Types used by services (mirror previous Prisma models shape where relevant)
export type DbUser = {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  provider: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  isPremium: boolean;
  premiumExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// User management
export const userService = {
  // Create or update user from OAuth
  async upsertUser(oauthData: {
    email: string;
    name: string;
    picture?: string;
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<DbUser> {
    const db = await getDatabase();
    const users = db.collection<DbUser>('users');

    const now = new Date();
    const existing = await users.findOne({ provider: oauthData.provider, providerId: oauthData.providerId });

    if (existing) {
      const update = {
        $set: {
          email: oauthData.email,
          name: oauthData.name,
          picture: oauthData.picture ?? null,
          accessToken: oauthData.accessToken ?? null,
          refreshToken: oauthData.refreshToken ?? null,
          updatedAt: now,
        },
      };
      await users.updateOne({ id: existing.id }, update);
      return { ...existing, ...update.$set } as DbUser;
    }

    const user: DbUser = {
      id: generateId(),
      email: oauthData.email,
      name: oauthData.name,
      picture: oauthData.picture ?? null,
      provider: oauthData.provider,
      providerId: oauthData.providerId,
      accessToken: oauthData.accessToken ?? null,
      refreshToken: oauthData.refreshToken ?? null,
      isPremium: false,
      premiumExpiresAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await users.insertOne(user);
    return user;
  },

  // Get user by ID
  async getUserById(id: string): Promise<DbUser | null> {
    const db = await getDatabase();
    return await db.collection<DbUser>('users').findOne({ id });
  },

  // Get user by OAuth provider and ID
  async getUserByProvider(provider: string, providerId: string): Promise<DbUser | null> {
    const db = await getDatabase();
    return await db.collection<DbUser>('users').findOne({ provider, providerId });
  },

  // Update user premium status
  async updatePremiumStatus(userId: string, isPremium: boolean, expiresAt?: Date): Promise<DbUser> {
    const db = await getDatabase();
    const users = db.collection<DbUser>('users');
    const now = new Date();
    await users.updateOne({ id: userId }, { $set: { isPremium, premiumExpiresAt: expiresAt ?? null, updatedAt: now } });
    const updated = await users.findOne({ id: userId });
    if (!updated) throw new Error('User not found after update');
    return updated;
  },

  // Update user profile
  async updateUser(userId: string, updates: { name?: string; email?: string; picture?: string }): Promise<DbUser | null> {
    const db = await getDatabase();
    const users = db.collection<DbUser>('users');
    const now = new Date();
    
    const updateData: any = { updatedAt: now };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.picture !== undefined) updateData.picture = updates.picture;
    
    await users.updateOne({ id: userId }, { $set: updateData });
    const updated = await users.findOne({ id: userId });
    return updated;
  },
};

// Time capsule management
export const timeCapsuleService = {
  // Create new time capsule
  async createTimeCapsule(data: {
    userId: string;
    message: string;
    deliveryDate: Date;
  }) {
    const db = await getDatabase();
    const doc = {
      id: generateId(),
      userId: data.userId,
      message: data.message,
      deliveryDate: data.deliveryDate,
      isDelivered: false,
      deliveredAt: null as Date | null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('timeCapsules').insertOne(doc);
    return doc;
  },

  // Get user's time capsules
  async getUserTimeCapsules(userId: string) {
    const db = await getDatabase();
    return await db
      .collection('timeCapsules')
      .find({ userId })
      .sort({ deliveryDate: 1 })
      .toArray();
  },

  // Delete time capsule
  async deleteTimeCapsule(id: string, userId: string) {
    const db = await getDatabase();
    const res = await db.collection('timeCapsules').deleteMany({ id, userId });
    return { count: res.deletedCount ?? 0 };
  },

  // Get capsules ready for delivery
  async getCapsulesForDelivery() {
    const db = await getDatabase();
    const now = new Date();
    return await db
      .collection('timeCapsules')
      .find({ isDelivered: false, deliveryDate: { $lte: now } })
      .toArray();
  },

  // Mark capsule as delivered
  async markAsDelivered(id: string) {
    const db = await getDatabase();
    await db
      .collection('timeCapsules')
      .updateOne({ id }, { $set: { isDelivered: true, deliveredAt: new Date(), updatedAt: new Date() } });
    return await db.collection('timeCapsules').findOne({ id });
  },
};

// Payment management
export const paymentService = {
  // Create payment record
  async createPayment(data: {
    userId: string;
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    premiumMonths: number;
  }) {
    const db = await getDatabase();
    const doc = {
      id: generateId(),
      userId: data.userId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      premiumMonths: data.premiumMonths,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('payments').insertOne(doc);
    return doc;
  },

  // Update payment status
  async updatePaymentStatus(stripePaymentIntentId: string, status: string) {
    const db = await getDatabase();
    await db
      .collection('payments')
      .updateOne({ stripePaymentIntentId }, { $set: { status, updatedAt: new Date() } });
    return await db.collection('payments').findOne({ stripePaymentIntentId });
  },

  // Get user's payment history
  async getUserPayments(userId: string) {
    const db = await getDatabase();
    return await db
      .collection('payments')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  },
};

// User settings management
export const userSettingsService = {
  // Get or create user settings
  async getOrCreateUserSettings(userId: string) {
    const db = await getDatabase();
    const coll: Collection<any> = db.collection('userSettings');
    let settings = await coll.findOne({ userId });
    if (!settings) {
      settings = {
        _id: new ObjectId(),
        id: generateId(),
        userId,
        emailNotifications: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await coll.insertOne(settings as any);
    }
    return settings;
  },

  // Update user settings
  async updateUserSettings(userId: string, data: Partial<{
    emailNotifications: boolean;
    theme: string;
    language: string;
    timezone: string;
  }>) {
    const db = await getDatabase();
    const coll: Collection<any> = db.collection('userSettings');
    const now = new Date();
    await coll.updateOne(
      { userId },
      {
        $setOnInsert: { _id: new ObjectId(), id: generateId(), userId, createdAt: now },
        $set: { ...data, updatedAt: now },
      },
      { upsert: true }
    );
    return await coll.findOne({ userId });
  },
};
