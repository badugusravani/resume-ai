export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  profilePicture?: string;
  isAdmin?: boolean;
}

interface StoredUser extends Omit<User, 'createdAt'> {
  createdAt: string;
  password: string;
}

// Simulated database using localStorage
const USERS_KEY = 'resume_maker_users';
const CURRENT_USER_KEY = 'resume_maker_current_user';

// Helper functions
const getStoredUsers = (): Record<string, StoredUser> => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

const setStoredUsers = (users: Record<string, StoredUser>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Create default admin if not exists
const createDefaultAdmin = () => {
  try {
    const users = getStoredUsers();
    const adminEmail = 'admin@resumeai.com';
    
    if (!users[adminEmail]) {
      console.log('Creating default admin account...');
      const adminUser: StoredUser = {
        id: generateId(),
        email: adminEmail,
        name: 'Admin User',
        password: 'admin123',
        createdAt: new Date().toISOString(),
        isAdmin: true
      };
      
      users[adminEmail] = adminUser;
      setStoredUsers(users);
      console.log('Default admin account created successfully');
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
};

// Initialize admin account immediately
createDefaultAdmin();

// Also export it for manual initialization if needed
export { createDefaultAdmin };

// Auth functions
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  isAdmin: boolean = false
): Promise<User> => {
  const users = getStoredUsers();

  if (users[email]) {
    throw new Error('User already exists');
  }

  const newUser: StoredUser = {
    id: generateId(),
    email,
    name,
    password, // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
    isAdmin
  };

  users[email] = newUser;
  setStoredUsers(users);

  // Store current user
  const currentUser: User = {
    ...newUser,
    createdAt: new Date(newUser.createdAt),
  };
  delete (currentUser as any).password;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  return currentUser;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // Ensure admin exists before login attempt
    createDefaultAdmin();
    
    const users = getStoredUsers();
    const user = users[email];

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Store current user with proper date conversion
    const currentUser: User = {
      ...user,
      createdAt: new Date(user.createdAt),
    };
    delete (currentUser as any).password;
    
    // Ensure we're storing a valid user object
    if (!currentUser.id || !currentUser.email) {
      throw new Error('Invalid user data');
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    console.log('User logged in successfully:', currentUser.email);
    
    return currentUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  if (!currentUser) return null;

  const user = JSON.parse(currentUser);
  return {
    ...user,
    createdAt: new Date(user.createdAt),
  };
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'isAdmin'>>
): Promise<User> => {
  const users = getStoredUsers();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const user = users[currentUser.email];
  if (!user || user.id !== userId) {
    throw new Error('User not found');
  }

  const updatedUser = {
    ...user,
    ...updates,
  };

  users[currentUser.email] = updatedUser;
  setStoredUsers(users);

  const returnUser: User = {
    ...updatedUser,
    createdAt: new Date(updatedUser.createdAt),
  };
  delete (returnUser as any).password;

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(returnUser));
  return returnUser;
}; 