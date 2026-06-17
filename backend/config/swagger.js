const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoRecycle API',
      version: '1.0.0',
      description: 'REST API for the EcoRecycle E-Waste Collection Management System (SDG 12). Built with Node.js + Express + lowdb.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token. Get one from POST /api/auth/login',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Kim Sok' },
            email: { type: 'string', example: 'kim@example.com' },
            password: { type: 'string', example: '123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'kim@example.com' },
            password: { type: 'string', example: '123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string', enum: ['user', 'staff'] },
                points: { type: 'integer' },
              },
            },
          },
        },
        PickupRequest: {
          type: 'object',
          required: ['category', 'weight', 'date', 'street'],
          properties: {
            category: { type: 'string', example: 'Laptop / Computer', enum: ['Laptop / Computer','Smartphone / Tablet','Printer / Scanner','TV / Monitor','Kitchen Appliance','Other Electronics'] },
            description: { type: 'string', example: 'Old MacBook Pro' },
            itemCount: { type: 'integer', example: 2 },
            weight: { type: 'number', example: 8.5 },
            date: { type: 'string', format: 'date', example: '2026-07-01' },
            timeSlot: { type: 'string', example: 'Morning (8AM–12PM)' },
            street: { type: 'string', example: '12 Norodom Blvd' },
            city: { type: 'string', example: 'Phnom Penh' },
            postal: { type: 'string', example: '12000' },
            notes: { type: 'string', example: 'Call before arrival' },
          },
        },
        Pickup: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            userName: { type: 'string' },
            category: { type: 'string' },
            weight: { type: 'number' },
            date: { type: 'string' },
            status: { type: 'string', enum: ['pending','accepted','processing','recycled'] },
            street: { type: 'string' },
            city: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
        Reward: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            desc: { type: 'string' },
            pts: { type: 'integer' },
            cat: { type: 'string' },
            emoji: { type: 'string' },
            stock: { type: 'integer' },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registration, login, profile' },
      { name: 'Pickups', description: 'E-waste pickup requests (CRUD)' },
      { name: 'Rewards', description: 'Eco-points reward store' },
      { name: 'Impact', description: 'Environmental impact metrics' },
      { name: 'Articles', description: 'Awareness articles (CRUD)' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
