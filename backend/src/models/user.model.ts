import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  isVerified: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return !this.googleId; // Password not required for Google auth
      },
      minlength: 6
    },
    profilePicture: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 160,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function(this: IUser, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // If user signed up with Google, they don't have a password
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);