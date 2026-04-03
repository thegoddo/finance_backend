import "dotenv/config";

const dbUrl = new URL(process.env.DATABASE_URL);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("Parsed hostname:", dbUrl.hostname);
console.log("Parsed username:", dbUrl.username);
console.log("Parsed password:", dbUrl.password);
console.log("Parsed database:", dbUrl.pathname.substring(1));
console.log("Parsed port:", dbUrl.port || 3306);
