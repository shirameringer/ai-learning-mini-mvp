import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import health from "./routes/health";
import helmet from "helmet";
import morgan from "morgan";
import categories from "./routes/categories";
import lessons from "./routes/lessons"; 


const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());


// ראוטים
app.use("/api/health", health);
app.use("/api/categories", categories);
app.use("/api/lessons", lessons); 

// טיפול שגיאות
app.use(errorHandler);

export default app;
