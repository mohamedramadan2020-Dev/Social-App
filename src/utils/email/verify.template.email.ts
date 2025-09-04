export const verifyEmail=({otp,title}:{otp:number,title:string}):string=>{
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title> Sphere</title>
  <style>
    body {
      background-color:rgb(26, 14, 158);
      margin: 0;
      font-family: Arial, sans-serif;
      color:rgb(9, 112, 140);
    }
    .container {
      width: 60%;
      margin: 30px auto;
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .header {
      background:rgb(12, 41, 103);
      padding: 20px;
      text-align: center;
    }
    .header img {
      width: 80px;
    }
    .header h1 {
      color: #fff;
      margin: 10px 0 0 0;
      font-size: 20px;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .otp {
      display: inline-block;
      margin: 20px 0;
      padding: 15px 30px;
      background: #2563EB;
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      border-radius: 6px;
      letter-spacing: 4px;
    }
    .footer {
      background: #F1F5F9;
      padding: 20px;
      text-align: center;
    }
    .footer h3 {
      margin: 0 0 15px 0;
      color: #1E293B;
    }
    .social-icons img {
      width: 35px;
      margin: 0 8px;
    }
    a {
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png" alt="LinkIt Logo" />
      <h1>Welcome to LinkIt</h1>
    </div>
    
    <!-- Content -->
    <div class="content">
      <h2>${title}</h2>
      <p>Please use the OTP below to complete your verification:</p>
      <div class="otp">${otp}</div>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <h3>Stay Connected</h3>
      <div class="social-icons">
        <a href="${process.env.facebookLink}">
          <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" alt="Facebook">
        </a>
        <a href="${process.env.instegram}">
          <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" alt="Instagram">
        </a>
        <a href="${process.env.twitterLink}">
          <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" alt="Twitter">
        </a>
      </div>
      <p style="font-size: 12px; color: #64748B; margin-top: 15px;">
        &copy; ${new Date().getFullYear()} LinkIt. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}