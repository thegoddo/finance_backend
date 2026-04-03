import swaggerJsdoc from "swagger-jsdoc";

const getServerUrl = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  if (nodeEnv === "production") {
    return process.env.API_URL || "https://your-app.onrender.com";
  }
  return "http://localhost:5000";
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Backend API",
      version: "1.0.0",
      description:
        "API documentation for the User and Financial Records Management System",
    },
    servers: [
      {
        url: getServerUrl(),
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
        },
      },
    },
  },
  // Path to the API docs (we will write these in our routes/controllers)
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const specs = swaggerJsdoc(options);
export default specs;
