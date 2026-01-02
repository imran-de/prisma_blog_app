import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "User",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "Active",
        required: false,
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // console.log(user, url, token)
      try {
        const verificationURL = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma Blog" <team@prismablog.com>', // sender address
          to: user.email, // list of recipients
          subject: "Please verify your email", // subject line
          text: "Hello world?", // plain text body
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      background-color: #4f46e5;
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .content {
      padding: 32px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      margin: 24px 0;
      padding: 14px 28px;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      padding: 20px;
      font-size: 12px;
      color: #777777;
      text-align: center;
      background-color: #fafafa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prisma Blog</h1>
    </div>

    <div class="content">
      <h2>Verify your email address</h2>
      <p>
      Hello ${user.name} <br/> <br/>
        Thanks for signing up for <strong>Prisma Blog</strong>!  
        Please confirm your email address by clicking the button below.
      </p>

      <p style="text-align: center;">
        <a href="${verificationURL}" class="button">
          Verify Email
        </a>
      </p>

      <p>
        If you didn’t create an account, you can safely ignore this email.
      </p>

      <p>
        This link will expire for security reasons.
      </p>
    </div>

    <div class="footer">
      <p>
        © 2025 Prisma Blog. All rights reserved.<br />
        Need help? Contact us at team@prismablog.com
      </p>
    </div>
  </div>
</body>
</html>
`,
        });

        console.log("Message sent: %s", info.messageId);

      } catch (error) {
        console.log(error)
        console.error(error);
      }
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});