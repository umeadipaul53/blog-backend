const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const morgan = require("morgan");
const globalErrorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db");
const AppError = require("./utils/AppError");
const cookieParser = require("cookie-parser");

const isProduction = process.env.NODE_ENV === "production";

const frontendURL = isProduction
  ? ["https://chiscoblogfrontend.vercel.app"]
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: frontendURL,
    credentials: true, // must match with Axios `withCredentials: true`
  }),
);

const port = process.env.PORT || 2050;

//connect DB
connectDB();

//logging
app.use(morgan(isProduction ? "combined" : "dev"));

//--- Body parses for all normal routes ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.set("trust proxy", 1);

// Routes
const authRouter = require("./routes/authRoutes");
const blogPostRouter = require("./routes/blogPostRoutes");
const userRoute = require("./routes/userRoutes");

// default server test route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "server up and running", data: isProduction });
});

// --- api routes ---
app.use("/api/auth", authRouter);
app.use("/api/posts", blogPostRouter);
app.use("/api/user", userRoute);

// --- 404 handler ---
app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// ---- Global error handler
app.use(globalErrorHandler);

// ---- start server ----
app.listen(port, () => console.log(`Server running on PORT: ${port}`));
