# TypeScript REST API Learning Project

> A TypeScript REST API built for learning, practice, and demonstration of modern development patterns

[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![Learning](https://img.shields.io/badge/Purpose-Learning%20%26%20Practice-orange.svg)]()
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Learning Project Notice**: This is a demonstration/practice API built for educational purposes. It uses in-memory storage and is not intended for production use. Perfect for learning TypeScript patterns, API design, and testing strategies!

## Project Purpose

This project demonstrates **TypeScript use** in combination with Express.js:

**What it has:**
- Fully-typed TypeScript with strict mode
- Clean architecture with proper separation of concerns
- Error handling and validation
- Testing patterns
- Production-style code organization

**What it ISN'T:**
- Production-ready (uses in-memory storage)
- Scalable beyond development/learning
- Secured - does not include authentication or authorization

## Learning Features

### TypeScript
- **Strict Type Safety** - Every endpoint, request, and response fully typed
- **Utility Types** - Practical use of `Omit`, `Pick`, `Partial`, and custom types
- **Generic Patterns** - Reusable pagination, error handling, and service interfaces
- **Design Patterns** - Factory patterns and dependency injection

### Architecture Patterns  
- **Clean Architecture** - Clear separation between controllers, services, and data
- **Interface Design** - Easy testing and swappable implementations
- **Error Handling** - Custom error classes with proper HTTP status codes
- **Pagination** - Generic pagination system for any entity type

### Development Practices
- **Testing Ready** - Interface-based design enables easy mocking
- **Development Workflow** - Hot reload, type checking, and build scripts
- **Self-Documenting** - Types serve as living documentation
- **Input Validation** - Middleware with detailed error messages

## Tech Stack

- **Runtime**: Node.js 22+ (for latest TypeScript features)
- **Language**: TypeScript 5.1+ (strict mode enabled)
- **Framework**: Express.js 4.18+
- **Storage**: In-memory (Map-based, resets on restart)
- **Validation**: Custom type-safe middleware
- **Testing**: Jest with TypeScript integration
- **Development**: ts-node-dev with hot reload

## Quick Start

### Prerequisites

- Node.js 22 or higher
- npm or yarn package manager
- Basic TypeScript knowledge (helpful but not required)

### Installation

1. **Clone the repository**
```
git clone https://github.com/5ven/typescript-api-learning.git
cd typescript-api-learning
```
2. **Install dependencies**
```
yarn install
```
or
```
npm install
```
3. **Start the environment**
```
yarn dev
```
or
```
npm run dev
```
4. **Explore the API**

**Health check**
```
curl http://localhost:3000/health
```

**Get some sample data**
```
curl http://localhost:3000/api/users
```

The API comes pre-seeded with sample data for immediate experimentation.

## API Playground

Testing with tools like Postman and curl:

### Users API

| Method   | Endpoint         | Description          | Try It                                             |
|----------|----------------- |----------------------|----------------------------------------------------|
| `GET`    | `/api/users`     | Get paginated users  | `curl http://localhost:3000/api/users`             |
| `GET`    | `/api/users/:id` | Get specific user    | `curl http://localhost:3000/api/users/1`           |
| `POST`   | `/api/users`     | Create new user      | See example below                                  |
| `PUT`    | `/api/users/:id` | Update existing user | See example below.                                 |
| `DELETE` | `/api/users/:id` | Delete user          | `curl -X DELETE http://localhost:3000/api/users/1` |

### System

| Method | Endpoint | Description                       |
|--------|----------|-----------------------------------|
| `GET` | `/health` | Health check (always start here!) |

### Examples

**Create your first user:**
```bash
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{
"name": "Learning User",
"email": "learner@example.com",
"age": 25
}'
```
**Pagination:**
```bash
curl "http://localhost:3000/api/users?page=1&limit=5"
curl "http://localhost:3000/api/users?page=2&limit=2"
```
**Validation:**
This should fail validation (missing required fields)
```bash
curl -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"name": "Learning User"}'
```
## Learning Highlights

### TypeScript Patterns

**1. Utility Types in Action**
```typescript
// See how Omit creates clean API responses
type UserResponse = Omit<User, 'updatedAt' | 'createdAt'>;

// Pick for selecting specific fields
type UserSummary = Pick<User, 'id' | 'name' | 'isActive'>;
```
**2. Generic Interfaces**
```typescript
// Reusable pagination for any data type
interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    // ... more fields
}
```
**3. Clean Architecture**
```typescript
// Clean contracts enable easy testing
interface IUserService {
  getAllUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponse>>;
    // ... more methods
}
```
**4. Custom Error Types**
```typescript
// Type-safe error handling
class ValidationError extends AppError {
    readonly statusCode = 400;
    readonly errorCode = 'VALIDATION_ERROR';
    // ...
}
```

### When you're ready to add tests
```bash
yarn add --dev jest
yarn test
```

**Watch mode for active development**
```bash
yarn test:watch
```

The project architecture is designed to support comprehensive testing:
- **Unit tests** - Clean service separation enables isolated testing
- **Integration tests** - Complete API endpoints ready for end-to-end testing  
- **Contract tests** - Interface-based design supports contract testing
- **Type-safe mocks** - Full typing enables safe mocking patterns

## Development Learning

### Available Scripts

| Command      | Description                        | When to Use               |
|--------------|------------------------------------|---------------------------|
| `yarn dev`   | Development server with hot reload | Daily development         |
| `yarn build` | Compile TypeScript to JavaScript   | Testing production builds |
| `yarn start` | Run compiled JavaScript            | Testing the build output  |

### Learning Workflow

1. **Explore the types** in `src/types/` to understand the data structures
2. **Follow the flow** from routes → controllers → services → responses  
3. **Experiment with changes** - hot reload keeps you moving fast
4. **Break things intentionally** - see how TypeScript catches errors
5. **Add features** - try implementing new endpoints or data types

## What You'll Learn

### Beginner TypeScript Developers
- How to structure a real TypeScript project
- Interface vs type usage in practice
- Basic utility types (`Omit`, `Pick`, `Partial`)
- Type-safe API development

### Intermediate Developers  
- Clean architecture patterns
- Generic interfaces and reusability
- Advanced error handling strategies
- Testing patterns with TypeScript

### Experienced Developers
- Reference implementation for teaching others
- Patterns to adapt for production projects
- Architecture decision examples

## Experimentation Ideas

**Easy Modifications:**
- [ ] Add new fields to the User interface
- [ ] Create a new entity (Product, Post, etc.)
- [ ] Modify pagination defaults
- [ ] Add new validation rules

**Medium Challenges:**
- [ ] Implement soft delete functionality
- [ ] Add user role/permission system
- [ ] Create audit logging for changes
- [ ] Add search and filtering

**Advanced Projects:**
- [ ] Swap in-memory storage for a database
- [ ] Add authentication middleware
- [ ] Implement file upload handling
- [ ] Create automated API documentation

## From Learning to Production

When you're ready to build something real:

1. **Keep the architecture** - it's solid and scalable
2. **Swap the storage** - replace in-memory with database
3. **Add authentication** - JWT, sessions, or OAuth
4. **Environment config** - proper settings management  
5. **Monitoring** - add logging, metrics, health checks
6. **Testing** - write comprehensive test suites
7. **Deployment** - containerization and CI/CD

## Additional Resources

**TypeScript Learning:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)

**API Design:**
- [REST API Guidelines](https://restfulapi.net/)
- [Express.js Documentation](https://expressjs.com/)

**Testing:**
- [Jest Documentation](https://jestjs.io/)
- [TypeScript Testing Guide](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)

## Limitations & Disclaimers

**Data Storage:**
- **In-memory only** - data resets on server restart
- **Limited scale** - designed for development/learning

**Security:**
- **No authentication** - all endpoints are public
- **No authorization** - no user permissions
- **Basic validation** - production needs more robust checks

**Production Readiness:**
- **Not production ready** - missing critical production features
- **Learning focused** - optimized for understanding, not performance
- **Documentation over optimization** - clarity over efficiency

## License

This project is licensed under the MIT License - feel free to use it for learning, teaching, or as a foundation for your own projects!