import express, { Express, NextFunction, Request, Response } from "express";
import msal from "@azure/msal-node";

const app: Express = express();
const port: number = 5000;

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, access_token"
  );
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.post("/getProfile", (req: Request, res: Response) => {
  const token = req.body.token;
  const decodedJWT = decodeJWT(token);
  const tenantId = decodedJWT.tid;
  const msalClinet = new msal.ConfidentialClientApplication({
    auth: {
      clientId: process.env.ENTRA_APP_ID,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret: process.env.ENTRA_CLIENT_SECRET,
    },
  });
  const scopes = ["https://graph.microsoft.com/User.Read"];
  (async () => {
    const result = await msalClinet.acquireTokenOnBehalfOf({
      authority: `https://login.microsoftonline.com/${tenantId}`,
      oboAssertion: token,
      scopes: scopes,
      skipCache: false,
    });
    const graphResult = await fetch("https://graph.microsoft.com/v1.0/me", {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${result.accessToken}`,
      },
      cache: "default",
    });
    const profile = await graphResult.json();
    res.status(200).json(profile);
  })();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const decodeJWT = (token: string) => {
  const [, payload] = token.split(".");
  const buff = Buffer.from(payload, "base64");
  const payloadDecoded = buff.toString("utf-8");
  return JSON.parse(payloadDecoded);
};
