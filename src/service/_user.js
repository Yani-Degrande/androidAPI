const { getLogger } = require("../core/logger.js");
const ServiceError = require("../core/serviceError");
const { getPrisma } = require("../data/index.js");
const nodemailer = require("nodemailer");

const { generateAccessToken, generateRefreshToken } = require("./_token.js");
const { checkPassword } = require("../core/auth.js");
const {
  twoFactorEnabled,
  verifyTwoFactorCode,
  generateUniqueToken,
} = require("./_2fa.js");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getLogger();
  this.logger.debug(message, meta);
};

// === functions ===
const register = async (user) => {
  const { email, password } = user;
  debugLog(`registering user ${email}`);

  const newUser = await getPrisma().user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  return newUser;
};

const getUserByEmail = async (email) => {
  debugLog(`getting user ${email}`);
  const foundUser = await getPrisma().user.findUnique({
    where: {
      email,
    },
    include: {
      twoFactor: true,
    },
  });

  if (!foundUser) {
    throw new ServiceError("User not found", 404);
  }

  return foundUser;
};

const login = async (user) => {
  const { email, password } = user;
  debugLog(`logging in user ${email}`);

  const foundUser = await getUserByEmail(email);

  const isMatch = await checkPassword(password, foundUser.password);

  if (!isMatch) {
    throw new ServiceError("Invalid password", 401);
  }

  if (twoFactorEnabled(foundUser)) {
    // 2FA is enabled for the user,verify the 2FA code

    const uniqueToken = generateUniqueToken(); // Implement a secure token generation function
    const uniqueTokenHash = await bcrypt.hash(uniqueToken, 10); // Hash the token
    const tokenPayload = {
      userId: foundUser.id,
      uniqueToken,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "4m",
    });

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 4);
    await getPrisma().twoFactor.update({
      where: {
        userId: foundUser.id,
      },
      data: {
        uniqueToken: uniqueTokenHash, // Store the hashed token in the database
        expirationTime: expirationTime, // Set the calculated expiration time
      },
    });

    // Server-side code
    const response = {
      status: 302,
      message: "2FA is required",
      uniqueToken: token, // Include the unique token in the response
    };

    return response;
  }

  const accessToken = generateAccessToken({ userId: foundUser.id });
  const refreshToken = generateRefreshToken({ userId: foundUser.id });

  await getPrisma().user.update({
    where: {
      id: foundUser.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async ({ email }) => {
  debugLog(`Forgot password for user ${email}`);

  const foundUser = await getUserByEmail(email);

  if (!foundUser) {
    throw new ServiceError("User not found", 404);
  }

  const uniqueToken = generateUniqueToken(); // Implement a secure token generation function
  const uniqueTokenHash = await bcrypt.hash(uniqueToken, 10); // Hash the token

  const tokenPayload = {
    userId: foundUser.id,
    uniqueToken,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "4m",
  });

  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 4);

  await getPrisma().user.update({
    where: {
      id: foundUser.id,
    },
    data: {
      uniqueToken: uniqueTokenHash, // Store the hashed token in the database
      expirationTime: expirationTime, // Set the calculated expiration time
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Password Reset",
    html: `
    <html>
    <head>
      <style>
        /* Add your custom email styles here */
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        a {
          color: #000;
        }

        .header {
          text-align: center;
          padding: 20px 0;
        }
        .header img {
          max-width: 100px; /* Adjust the size of your logo */
          margin-bottom: 10px;
          margin-left: 15px;
          transform: translateY(-15px);
          float: left;
        }
        .header h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .message {
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .message p {
          font-size: 16px;
          color: #555;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        .primary-btn {
          background-color: #f1e2d1;
          color: #000;
          text-decoration: none;
        
          width: 100%;
        
          border: none;
          outline: none;
          border-radius: 0.5rem;
        
          padding: 0.5rem 1rem;
        
          cursor: pointer;
        
          font-size: 14px;
          font-weight: 700;
        
          transition: all 0.3s ease-in-out;
        
          user-select: none;
        }
        .primary-btn a {
          color: #000;
          text-decoration: none;
        }
        .ii a[href] {
          color: #000 !important;
      }

        .primary-btn:focus {
            outline: none;
          }
        
          .primary-btn:hover {
            background-color: #e2d1bd;
            outline: 2px solid #f1e2d1;
          }
        
        .disclaimer {
          font-size: 14px;
          color: #777;
          margin-top: 20px;
        }
        .divider {
          border-top: 1px solid #ddd;
          margin: 20px 0;
        }
        .divider: first-child {
          transform: translateY(5px);
        }
        .footer {
          font-size: 12px;
          color: #777;
          margin-top: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="cid:logo" alt="Company Logo" /> <!-- Replace with your logo image URL -->
        </div>
        <hr class="divider" />
        <div class="message">
          <p>Hello,</p>
          <p>We've received a request to reset the password associated with the account with email: ${email}. So far no changes have been made to your account.</p>
          <p>You can click the link below to reset your password:</p>
          <a class="primary-btn" href="${resetLink}">Reset Your Password</a>
          <p>If you did not request the password change, please respond to this email as soon as possible.</p>
          <p>- The Support team</p>
        </div>
        <hr class="divider" />
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Degrande Development</p>
        </div>
      </div>
    </body>
  </html>
  

  
    `,
    attachments: [
      {
        filename: "logo.png",
        path: "./src/assets/logo.png",
        cid: "logo", //same cid value as in the html img src
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ServiceError("Error sending email", 500);
  }

  return {
    message: "Password reset link sent",

    // For testing purposes
    resetLink,
  };
};

module.exports = {
  register,
  login,
  getUserByEmail,
  forgotPassword,
};
