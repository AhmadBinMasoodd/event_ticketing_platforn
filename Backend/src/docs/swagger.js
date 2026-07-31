import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Event Ticketing Platform API",
            version: "1.0.0",
            description: "Backend API documentation for Event Ticketing Platform",
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1",
                description: "Development Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: ["./src/routes/**/*.js"], // routes containing Swagger comments
};
const swaggerSpec = swaggerJsdoc(options);
//console.log(swaggerSpec.paths);

export default swaggerSpec;