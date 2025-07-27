import express, { request } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";

import productRoutes from './routes/productRoutes.js';
import { sql } from './config/db.js';
import { aj } from "./lib/arcjet.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors({}));
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan("dev"));

// apply arcjet rate-limit middleware to all routes
app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1,
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({ message: "Too many requests" });
            } else if (decision.reason.isBot()) {
                res.status(403).json({ message: "Bot Access denied" });
            } else {
                res.status(403).json({ message: "Forbidden" });
            }
            return;
        }

        if (
            decision.results.some(
                (result) =>
                    result.reason &&
                    typeof result.reason.isBot === "function" &&
                    result.reason.isBot() &&
                    typeof result.reason.isSpoofed === "function" &&
                    result.reason.isSpoofed()
            )
        ) {
            res.status(403).json({ message: "Spoofed bot detected" });
            return;
        }


        next();
    } catch (error) {
        console.error("Arcjet error:", error);
        next(error);
    }
});

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

async function initDB() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            image VARCHAR(255) NOT NULL
        );`;
        console.log("Database initialized");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});