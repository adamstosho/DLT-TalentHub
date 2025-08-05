const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DLT TalentHub API',
      version: '1.0.0',
      description: `
        # DLT TalentHub API Documentation
        
        ## Overview
        This API provides endpoints for user authentication, talent management, job postings, recruitment, and administrative functions.
        
        ## Authentication
        Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\`\`
        
        ## Rate Limiting
        API requests are rate-limited to 100 requests per 15 minutes per IP address.
        
        ## Error Responses
        All error responses follow a consistent format:
        \`\`\`json
        {
          "status": "error",
          "message": "Error description",
          "errors": ["Detailed error messages"]
        }
        \`\`\`
        
        ## Getting Started
        1. Register a new user account
        2. Login to get your JWT token
        3. Use the token in the Authorization header for protected endpoints
        4. Explore the available endpoints based on your role (talent, recruiter, admin)
      `,
      contact: {
        name: 'DLT TalentHub Team',
        email: 'support@dlt-talenthub.com',
        url: 'https://dlt-talenthub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server'
        },
        {
          url: 'https://api.dlt-talenthub.com',
          description: 'Production server'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'System',
        description: 'System health and status endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User profile management endpoints'
      },
      {
        name: 'Talents',
        description: 'Talent profile and search endpoints'
      },
      {
        name: 'Recruiters',
        description: 'Recruiter dashboard and management endpoints'
      },
      {
        name: 'Jobs',
        description: 'Job posting and application endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative and system management endpoints'
      },
      {
        name: 'Notifications',
        description: 'User notification management endpoints'
      }
    ]
  },
  apis: [
    path.join(__dirname, 'routes/*.js'),
    path.join(__dirname, 'models/*.js'),
    path.join(__dirname, 'swagger.yaml')
  ]
};

// Generate Swagger specification
const specs = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; font-size: 36px; font-weight: 300; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #61affe; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #49cc90; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fca130; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f93e3e; }
    .swagger-ui .opblock { border-radius: 8px; margin-bottom: 10px; }
    .swagger-ui .opblock .opblock-summary { border-radius: 8px 8px 0 0; }
    .swagger-ui .opblock .opblock-summary-description { font-weight: 500; }
    .swagger-ui .responses-table .response-col_status { font-weight: 600; }
    .swagger-ui .responses-table .response-col_description { font-size: 14px; }
    .swagger-ui .model { font-size: 14px; }
    .swagger-ui .model-title { font-weight: 600; color: #2c3e50; }
    .swagger-ui .parameter__name { font-weight: 600; color: #2c3e50; }
    .swagger-ui .parameter__type { color: #7f8c8d; }
    .swagger-ui .parameter__deprecated { color: #e74c3c; }
    .swagger-ui .btn.execute { background-color: #4990e2; border-color: #4990e2; }
    .swagger-ui .btn.execute:hover { background-color: #357abd; border-color: #357abd; }
    .swagger-ui .auth-wrapper { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .swagger-ui .auth-container { margin: 0; }
    .swagger-ui .auth-container input { border: 1px solid #ddd; border-radius: 4px; padding: 8px 12px; }
    .swagger-ui .auth-container .btn { background-color: #4990e2; border-color: #4990e2; border-radius: 4px; }
    .swagger-ui .auth-container .btn:hover { background-color: #357abd; border-color: #357abd; }
  `,
  customSiteTitle: 'DLT TalentHub API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Add any request interceptor logic here
      return req;
    },
    responseInterceptor: (res) => {
      // Add any response interceptor logic here
      return res;
    }
  }
};

module.exports = {
  specs,
  swaggerUiOptions
}; 