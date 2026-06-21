// Static mock email templates and training content
const MOCK_EMAIL_TEMPLATES = [
  {
    id: "google_alert",
    type: "phishing",
    difficulty: "Medium",
    senderName: "Google Workspace Security",
    senderEmail: "accounts-noreply@security-google-verify.com",
    subject: "Security Alert: Suspicious login attempt blocked",
    date: "Today, 10:42 AM",
    unread: true,
    targetBrand: "Google Accounts",
    recipient: "you@corp-company.com",
    preview: "We detected an unusual sign-in attempt to your workspace account from an unknown IP address in Russia.",
    mockBrowserUrl: "http://google-accounts-security-verify.com/signin",
    bodyHtml: `
      <div style="font-family: Roboto, sans-serif; background-color: #f1f3f4; padding: 20px; border-radius: 4px; color: #3c4043;">
        <div style="background: white; max-width: 500px; margin: 0 auto; border-radius: 8px; border: 1px solid #dadce0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="padding: 24px 24px 0 24px; text-align: left;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png" style="height: 24px;" alt="Google" />
          </div>
          <div style="padding: 24px;">
            <h2 style="font-size: 20px; font-weight: 500; color: #202124; margin: 0 0 16px 0; border-bottom: 1px solid #e8eaed; padding-bottom: 16px;">Critical Security Alert</h2>
            <p style="font-size: 14px; line-height: 1.5; color: #3c4043;">We detected an unusual sign-in attempt targeting your corporate email workspace. Someone recently attempted to login from <b>Moscow, Russia (IP: 185.220.101.44)</b> using your correct credentials.</p>
            <div style="background-color: #f8d7da; border-radius: 6px; padding: 12px; margin: 16px 0; border: 1px solid #f5c6cb; color: #721c24; font-size: 13px;">
              <b>Action Required:</b> If this was not you, you must reset your password immediately to secure your access credentials.
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="#" id="mock-email-link" class="simulated-link" style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px;">Reset Password Now</a>
            </div>
            <p style="font-size: 12px; color: #5f6368; line-height: 1.4;">This is a system alert. To unsubscribe or manage notifications, visit the console settings.</p>
          </div>
        </div>
      </div>
    `,
    redFlags: [
      {
        num: 1,
        title: "Suspicious Sender Domain",
        description: "The sender domain is 'security-google-verify.com', not 'google.com'. Attackers use look-alike domains to deceive users.",
        highlightId: "sender-flag"
      },
      {
        num: 2,
        title: "Fear & Urgency Tactic",
        description: "The alert uses warning colors and warns that someone in Russia used your 'correct credentials', causing panic and rushing you to click.",
        highlightId: "urgency-flag"
      },
      {
        num: 3,
        title: "Insecure Destination Link (HTTP)",
        description: "The button links to an insecure HTTP page: 'http://google-accounts-security-verify.com/signin' which has a misspelled, look-alike domain.",
        highlightId: "link-flag"
      }
    ],
    // Form templates rendered inside browser viewport
    mockLoginHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #fff; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div style="width: 400px; border: 1px solid #dadce0; border-radius: 8px; padding: 40px; text-align: center;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png" style="height: 28px; margin-bottom: 16px;" />
          <h2 style="font-size: 24px; font-weight: 400; color: #202124; margin-bottom: 8px;">Sign in</h2>
          <p style="font-size: 16px; color: #202124; margin-bottom: 24px;">to continue to Workspace Security</p>
          <form id="mock-login-form">
            <div style="margin-bottom: 20px; text-align: left;">
              <input type="text" id="fake-user" placeholder="Email or phone" style="width: 100%; padding: 14px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px;" required value="you@corp-company.com" readonly />
            </div>
            <div style="margin-bottom: 24px; text-align: left;">
              <input type="password" id="fake-pass" placeholder="Enter your password" style="width: 100%; padding: 14px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px;" required />
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
              <a href="#" style="color: #1a73e8; text-decoration: none; font-size: 14px; font-weight: 500;">Forgot password?</a>
              <button type="submit" style="background-color: #1a73e8; color: white; border: none; padding: 10px 24px; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer;">Next</button>
            </div>
          </form>
        </div>
      </div>
    `
  },
  {
    id: "hr_benefits",
    type: "phishing",
    difficulty: "High",
    senderName: "Corporate HR Support Desk",
    senderEmail: "hr-update@corp-company-portal.com",
    subject: "Urgent: Updated Employee Health Benefits Plan - Q2 Sign-Off Required",
    date: "Yesterday, 3:15 PM",
    unread: true,
    targetBrand: "HR Portal",
    recipient: "you@corp-company.com",
    preview: "Please review the updated corporate healthcare benefit premium charts. Employee authorization sign-off is required.",
    mockBrowserUrl: "http://corp-company-portal.com/hr-benefits/auth",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 20px; color: #333;">
        <div style="background: white; max-width: 600px; margin: 0 auto; border-top: 5px solid #0052cc; border-radius: 4px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #0052cc; font-size: 18px; margin-top: 0;">Employee Benefits Portal Update</h2>
          <p>Dear Employee,</p>
          <p>As part of our mid-year benefits revision, the executive team has finalized the updated employee medical coverages and corporate co-pay premium scales for Q2 2026.</p>
          <p>All employees are <b>required to select their updated coverage package and sign off on the authorization paperwork</b>. Failure to finalize selections by end of business today will revert coverage to standard base-tier coverage.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f4f5f7;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Plan Option</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Monthly Premium Adjustments</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Premium HMO Plan</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #16a34a;">-$15.00 (Co-pay reduced)</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Standard PPO Cover</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626;">+$8.50 (Deductible adjustment)</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" id="mock-email-link" class="simulated-link" style="display: inline-block; background-color: #0052cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Review & Approve Plan Adjustments</a>
          </div>
          <p>Thank you,</p>
          <p><b>Benefits Enrollment Team</b><br>Human Resources Department</p>
        </div>
      </div>
    `,
    redFlags: [
      {
        num: 1,
        title: "Misleading Subdomain/Domain spoofing",
        description: "The email address domain is 'corp-company-portal.com' instead of the official internal 'corp-company.com'. Attackers register dashes in domain names to look like official internal sub-websites.",
        highlightId: "sender-flag"
      },
      {
        num: 2,
        title: "Strict Deadline Coercion",
        description: "It pressures you with 'reverting coverage to base tier' if not signed off by end of day. Threatening immediate negative consequences is an indicator of phishing.",
        highlightId: "urgency-flag"
      },
      {
        num: 3,
        title: "Look-alike Login Landing Page",
        description: "The link points to 'corp-company-portal.com', which is external, and opens an unencrypted login portal to harvest enterprise Single Sign-On credentials.",
        highlightId: "link-flag"
      }
    ],
    mockLoginHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f6f8; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div style="width: 450px; background: white; border-radius: 8px; border: 1px solid #e1e4e8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
          <div style="background-color: #0052cc; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Internal Employee SSO Portal</h2>
          </div>
          <div style="padding: 32px;">
            <form id="mock-login-form">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 12px; font-weight: bold; color: #5e6c84; margin-bottom: 8px;">COMPANY EMAIL</label>
                <input type="text" id="fake-user" style="width: 100%; padding: 12px; border: 1px solid #dfe1e6; border-radius: 4px; font-size: 14px;" value="you@corp-company.com" readonly />
              </div>
              <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 12px; font-weight: bold; color: #5e6c84; margin-bottom: 8px;">ACTIVE DIRECTORY PASSWORD</label>
                <input type="password" id="fake-pass" placeholder="SSO Credentials" style="width: 100%; padding: 12px; border: 1px solid #dfe1e6; border-radius: 4px; font-size: 14px;" required />
              </div>
              <button type="submit" style="width: 100%; background-color: #0052cc; color: white; border: none; padding: 14px; border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer;">Authenticate & Sign Document</button>
            </form>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "devops_newsletter",
    type: "legitimate",
    difficulty: "Easy",
    senderName: "DevOps Weekly Digest",
    senderEmail: "digest@devops-newsletter.org",
    subject: "DevOps Weekly: CI/CD Pipelines & Docker Best Practices",
    date: "June 20, 11:30 AM",
    unread: false,
    targetBrand: "DevOps Weekly",
    recipient: "you@corp-company.com",
    preview: "In this edition, we explore automated container validation steps, Docker multi-stage build optimization, and local build speed improvements.",
    mockBrowserUrl: "https://devops-newsletter.org/posts/docker-best-practices",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #444;">
        <div style="background: white; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 6px; overflow: hidden;">
          <div style="background-color: #24292e; color: white; padding: 20px 24px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 500;">DevOps Digest</h1>
          </div>
          <div style="padding: 24px;">
            <p>Hi there,</p>
            <p>Welcome to this week's issue of DevOps Digest, your curated summary of Docker updates and cloud architecture guides.</p>
            
            <h3 style="color: #0366d6; margin-top: 24px;">1. Optimizing Docker Multi-Stage Builds</h3>
            <p>Keep your production containers tiny! We break down how to use multi-stage compilation steps to strip development dependencies from final runtime images.</p>
            <a href="#" id="mock-email-link" class="simulated-link" style="color: #0366d6; text-decoration: none; font-weight: 600;">Read the tutorial &rarr;</a>
            
            <h3 style="color: #0366d6; margin-top: 24px;">2. Secure CI/CD Pipeline Practices</h3>
            <p>Are your pipeline environment secrets stored safely? Read why injecting credentials via runner environments is safer than hardcoding configuration files.</p>
            
            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #888;">
              You received this newsletter because you subscribed. To unsubscribe, click <a href="#" style="color: #888;">here</a>.
            </div>
          </div>
        </div>
      </div>
    `,
    redFlags: [],
    mockLoginHtml: ""
  },
  {
    id: "docusign_agreement",
    type: "phishing",
    difficulty: "Medium",
    senderName: "DocuSign Service Desk",
    senderEmail: "docusign@secure-signature-service.com",
    subject: "Please sign: Employee Mutual Non-Disclosure Agreement (NDA)",
    date: "June 19, 09:12 AM",
    unread: false,
    targetBrand: "DocuSign",
    recipient: "you@corp-company.com",
    preview: "Please review and complete the DocuSign NDA document sent by the corporate compliance management division.",
    mockBrowserUrl: "https://docusign-envelope-review.com/signing/portal",
    bodyHtml: `
      <div style="font-family: Helvetica, Arial, sans-serif; background-color: #f7f7f7; padding: 20px; color: #333;">
        <div style="background: white; max-width: 600px; margin: 0 auto; border: 1px solid #e2e2e2; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
          <div style="background-color: #1e3a8a; padding: 16px 24px; color: white;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/DocuSign_Logo.svg/320px-DocuSign_Logo.svg.png" style="height: 22px; filter: brightness(0) invert(1);" alt="DocuSign" />
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 15px; font-weight: bold; margin-top: 0;">Compliance Officer requested your electronic signature on the following document:</p>
            <div style="background-color: #f3f4f6; border-left: 5px solid #1e3a8a; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;">
              <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #1e3a8a;">Mutual NDA & IP Agreement Addendum.pdf</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Sender: compliance-team@corp-company.com via DocuSign</p>
            </div>
            <p style="font-size: 14px; line-height: 1.5;">Please access the document link below to complete the verification checklist and sign online. The transaction details will be forwarded to corporate archives.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" id="mock-email-link" class="simulated-link" style="display: inline-block; background-color: #ffcc00; color: #000; padding: 14px 36px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Review & Sign Document</a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.4;">Do not share this email invitation. Access credentials are bound to your individual corporate mailbox address.</p>
          </div>
        </div>
      </div>
    `,
    redFlags: [
      {
        num: 1,
        title: "Third-Party Email Spoofing",
        description: "The sender claims to be DocuSign Service Desk but the email comes from 'secure-signature-service.com'. Official DocuSign notifications always originate from 'docusign.net' or 'docusign.com'.",
        highlightId: "sender-flag"
      },
      {
        num: 2,
        title: "Suspicious Redirection Domain",
        description: "The destination address 'docusign-envelope-review.com' is not owned by DocuSign. Attackers register similar domain names to spoof the login screens of popular platforms.",
        highlightId: "link-flag"
      }
    ],
    mockLoginHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #f7f9fa; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div style="width: 440px; background: white; border: 1px solid #e3e8ec; padding: 40px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/DocuSign_Logo.svg/320px-DocuSign_Logo.svg.png" style="height: 28px; margin-bottom: 24px;" />
          <h2 style="font-size: 22px; font-weight: 700; color: #333; margin-bottom: 8px;">Access Your Envelope</h2>
          <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Please authenticate to access securely.</p>
          <form id="mock-login-form">
            <div style="margin-bottom: 16px;">
              <input type="email" id="fake-user" style="width: 100%; padding: 12px; border: 1px solid #cccccc; border-radius: 4px; font-size: 14px;" value="you@corp-company.com" readonly />
            </div>
            <div style="margin-bottom: 20px;">
              <input type="password" id="fake-pass" placeholder="Password" style="width: 100%; padding: 12px; border: 1px solid #cccccc; border-radius: 4px; font-size: 14px;" required />
            </div>
            <button type="submit" style="width: 100%; background-color: #1e3a8a; color: white; padding: 14px; border: none; border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer;">Continue to Document</button>
          </form>
        </div>
      </div>
    `
  },
  {
    id: "corp_meeting",
    type: "legitimate",
    difficulty: "Easy",
    senderName: "Internal Communications",
    senderEmail: "comms@corp-company.com",
    subject: "Q2 Company All-Hands Meeting - Calendar Invite",
    date: "June 18, 02:00 PM",
    unread: false,
    targetBrand: "Internal Comms",
    recipient: "you@corp-company.com",
    preview: "Please join the executive team this Friday for our Q2 business update and corporate roadmap walkthrough.",
    mockBrowserUrl: "https://meeting.corp-company.com/townhall-q2",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; color: #1f2937;">
        <div style="background: white; max-width: 600px; margin: 0 auto; border-top: 4px solid #10b981; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0;">Quarterly Town Hall Meeting</h2>
          <p>Hi Team,</p>
          <p>It's time for our quarterly all-hands update! Our leadership group will share our financial metrics, highlight key product milestones, and host a Q&A session.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><b>Date:</b> Friday, June 26, 2026</p>
            <p style="margin: 4px 0 0 0; font-size: 14px;"><b>Time:</b> 10:00 AM - 11:30 AM EST</p>
            <p style="margin: 4px 0 0 0; font-size: 14px;"><b>Access Link:</b> <a href="#" id="mock-email-link" class="simulated-link">meeting.corp-company.com/townhall-q2</a></p>
          </div>
          
          <p>Please review slides in advance. You can submit questions anonymously via the slack #townhall channel.</p>
          <p>Best regards,<br><b>Internal Communications Group</b></p>
        </div>
      </div>
    `,
    redFlags: [],
    mockLoginHtml: ""
  },
  {
    id: "overdue_invoice",
    type: "phishing",
    difficulty: "High",
    senderName: "Finance Billing Services",
    senderEmail: "invoices@finance-billing-desk.net",
    subject: "OVERDUE INVOICE #99834 - Service Suspension Threat",
    date: "June 17, 11:00 AM",
    unread: false,
    targetBrand: "Cloud Services Invoice",
    recipient: "you@corp-company.com",
    preview: "Your company cloud billing account has an unpaid invoice balance of $1,420.00. Account termination scheduled in 48 hours.",
    mockBrowserUrl: "http://finance-billing-desk.net/invoice/pay",
    bodyHtml: `
      <div style="font-family: sans-serif; background-color: #fcfcfc; padding: 20px; color: #222;">
        <div style="background: white; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 4px; padding: 30px;">
          <h2 style="color: #d32f2f; margin-top: 0;">Urgent Notice: Outstanding Payment</h2>
          <p>Dear Customer,</p>
          <p>This email serves as an automated notice that invoice <b>#99834</b> is now 14 days overdue. Efforts to charge the backup credit card associated with your enterprise server account failed.</p>
          
          <div style="border: 1px solid #d32f2f; padding: 16px; margin: 20px 0; border-radius: 4px; background-color: #ffebee;">
            <p style="margin: 0; color: #c62828;"><b>Unpaid Balance:</b> $1,420.00 USD</p>
            <p style="margin: 4px 0 0 0; color: #c62828;"><b>Suspension Date:</b> 48 Hours from delivery timestamp</p>
          </div>
          
          <p>To avoid disruption of your live database clusters and active client host APIs, please update billing information immediately.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" id="mock-email-link" class="simulated-link" style="display: inline-block; background-color: #d32f2f; color: white; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Pay Invoice Outstanding</a>
          </div>
          
          <p>Account Administration Team</p>
        </div>
      </div>
    `,
    redFlags: [
      {
        num: 1,
        title: "Generic Salutation",
        description: "The greeting 'Dear Customer' is generic. Legitimate internal billing departments or key service providers know the name of the user or company account manager.",
        highlightId: "urgency-flag"
      },
      {
        num: 2,
        title: "Aggressive Threats of Termination",
        description: "Attackers threaten 'suspension of live database clusters within 48 hours' to bypass logical analysis and trick the employee into making a fast payment error.",
        highlightId: "urgency-flag"
      },
      {
        num: 3,
        title: "Suspicious Unencrypted External Domain",
        description: "The link points to 'http://finance-billing-desk.net/invoice/pay'. The domain is completely external and uses unencrypted HTTP, indicating a malicious credential/card harvester page.",
        highlightId: "link-flag"
      }
    ],
    mockLoginHtml: `
      <div style="font-family: Arial, sans-serif; background-color: #fafbfc; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px 0;">
        <div style="width: 480px; background: white; border: 1px solid #dcdfe3; border-radius: 6px; padding: 32px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <h2 style="font-size: 20px; font-weight: 700; color: #d32f2f; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 12px;">Billing Update Verification</h2>
          <form id="mock-login-form">
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px;">Cardholder Name</label>
              <input type="text" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Full Name" required />
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px;">Credit Card Number</label>
              <input type="text" id="fake-user" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="XXXX-XXXX-XXXX-XXXX" required />
            </div>
            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
              <div style="flex: 1;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px;">Expiration Date</label>
                <input type="text" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="MM/YY" required />
              </div>
              <div style="flex: 1;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px;">CVV</label>
                <input type="password" id="fake-pass" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="XXX" required />
              </div>
            </div>
            <button type="submit" style="width: 100%; background-color: #d32f2f; color: white; padding: 12px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Authorize Payment Update</button>
          </form>
        </div>
      </div>
    `
  }
];

const MOCK_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "You receive an email from the IT support team stating that your password expires in 2 hours and you must change it immediately by clicking a link. What is the most secure action?",
    options: [
      "Click the link and quickly change your password to avoid service disruption.",
      "Reply directly to the email asking if this is a real warning request.",
      "Do not click the link. Open your browser, type the official IT Portal address manually, and verify if there is an active password change requirement.",
      "Ignore it because your password is secure and it won't actually lock you out."
    ],
    correctIdx: 2,
    explanation: "Attackers rely on urgency ('expires in 2 hours') to bypass logical checks. Never trust links inside unsolicited emails for credential updates; always navigate manually to official internal enterprise platforms."
  },
  {
    id: 2,
    question: "Which of the following is the most accurate definition of 'Spear Phishing' compared to standard 'Phishing'?",
    options: [
      "Spear Phishing is sent to millions of random contacts simultaneously using automated SMTP mail bots.",
      "Spear Phishing is a highly targeted attack directed at specific individuals or departments, using intelligence details (OSINT) to build custom Trust contexts.",
      "Spear Phishing only occurs over corporate phone networks via voice messages.",
      "Spear Phishing is a defensive term describing how firewalls trap dangerous emails."
    ],
    correctIdx: 1,
    explanation: "Standard phishing uses a 'spray and pray' model targeting random populations. Spear phishing is custom-targeted using personal details (name, role, current project details) to create high credibility."
  },
  {
    id: 3,
    question: "You inspect an email address details in your inbox. The sender is shown as 'Support <support@micros0ft-billing.com>'. What red flag is displayed here?",
    options: [
      "The sender name is too long.",
      "Typosquatting: the letter 'o' in Microsoft has been replaced with the number '0'.",
      "Billing supports must always have HTTPS protocols.",
      "There are no red flags; support addresses commonly vary this way."
    ],
    correctIdx: 1,
    explanation: "Typosquatting replaces characters with look-alike alternatives (like '0' for 'o', or 'rn' for 'm') to fool human readers at first glance. Always double-check domain spellings closely."
  },
  {
    id: 4,
    question: "If you hover your mouse cursor over a link inside an email and the status bar displays a URL that does not match the text description of the link, what should you do?",
    options: [
      "Click the link to verify if it redirects back to the official page.",
      "Assume the link is safe if it uses the HTTPS protocol.",
      "Report the email using the corporate Phish Report button without clicking.",
      "Forward the email to all teammates to see if they can open it."
    ],
    correctIdx: 2,
    explanation: "A mismatch between the displayed link text and the actual destination URL is a classic phishing indicator. The safest action is to immediately report the email via official tools."
  },
  {
    id: 5,
    question: "What is Smishing?",
    options: [
      "A software patching mechanism to intercept dangerous scripts.",
      "A social engineering attack conducted via SMS text messages containing malicious landing links.",
      "Phishing targeting voice communications (VoIP calls) using AI voice generators.",
      "A specific encryption policy protecting corporate email headers."
    ],
    correctIdx: 1,
    explanation: "Smishing is a portmanteau of SMS and Phishing. It targets mobile phone users with text messages mimicking shipping updates, banking alerts, or emergency notices containing tracking links."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MOCK_EMAIL_TEMPLATES, MOCK_QUIZ_QUESTIONS };
}
