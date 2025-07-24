import { Request, Response, NextFunction } from 'express';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.types';
import { CreatePostRequest } from '../types/post.types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreatePost = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content, authorId } = req.body as CreatePostRequest; // Adjust type as needed    
  const errors: string[] = [];
  // Validate required fields
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push('Title is required and must be at least 2 characters long');
  } else if (title.length > 100) {
    errors.push('Title must not exceed 100 characters');
  }
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    errors.push('Content is required and must be at least 10 characters long');
  } else if (content.length > 1000) {
    errors.push('Content must not exceed 1000 characters');
  }
  if (!authorId || typeof authorId !== 'string' || authorId.trim().length === 0) {
    errors.push('Author ID is required');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: errors
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
  next();
};

export const validateUpdatePost = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const updates = req.body as Partial<CreatePostRequest>; // Allow partial updates
  const errors: string[] = [];
  // Only validate fields that are present
  if (updates.title !== undefined) {
    if (typeof updates.title !== 'string' || updates.title.trim().length < 2) {
      errors.push('Title must be at least 2 characters long');
    } else if (updates.title.length > 100) {
      errors.push('Title must not exceed 100 characters');
    }
  }
  if (updates.content !== undefined) {
    if (typeof updates.content !== 'string' || updates.content.trim().length < 10) {
      errors.push('Content must be at least 10 characters long');
    } else if (updates.content.length > 1000) {
      errors.push('Content must not exceed 1000 characters');
    }
  }
  if (updates.authorId !== undefined) {
    if (typeof updates.authorId !== 'string' || updates.authorId.trim().length === 0) {
      errors.push('Author ID must be a valid string');
    }
  }
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: errors
      },
      timestamp: new Date().toISOString()
    });
    return;
  }
  next();
};

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, age } = req.body as CreateUserRequest;

  const errors: string[] = [];

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('Valid email is required');
  }

  if (typeof age !== 'number' || age < 0 || age > 150) {
    errors.push('Age must be a number between 0 and 150');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: errors
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const updates = req.body as UpdateUserRequest;
  const errors: string[] = [];

  // Only validate fields that are present
  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
  }

  if (updates.email !== undefined) {
    if (typeof updates.email !== 'string' || !EMAIL_REGEX.test(updates.email)) {
      errors.push('Email must be valid');
    }
  }

  if (updates.age !== undefined) {
    if (typeof updates.age !== 'number' || updates.age < 0 || updates.age > 150) {
      errors.push('Age must be a number between 0 and 150');
    }
  }

  if (updates.isActive !== undefined) {
    if (typeof updates.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: errors
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};
