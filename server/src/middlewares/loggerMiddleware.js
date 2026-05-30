import { format } from"date-fns";
import { v4 as uuid } from"uuid";
import fs from"fs";
import path from"path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fsPromises = fs.promises;

// log requests in logs file
const loggerMiddleware = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const reqUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const message = `${req.method}\t${res.statusCode}\t${req.headers.origin || 'Unknown'}\t${ip}\t${reqUrl}`;
  const datetime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${datetime}\t${uuid()}\t${message}\n`;

  const logDir = path.join(__dirname, "..", "logs");
  const logFilePath = path.join(logDir, "reqLogs.log");

  try {
    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir, { recursive: true });
    }

    await fsPromises.appendFile(logFilePath, logItem);
  } catch (error) {
    console.error("Error logging events:", error.message);
  }

  next();
};

export { loggerMiddleware };