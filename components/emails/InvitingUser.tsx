import * as React from "react";

interface InvitingUserProps {
  userName: string;
  masjidName: string;
  inviteLink: string;
  inviterName?: string;
  supportEmail?: string;
  token?: string;
}

const InvitingUser = ({
  userName,
  masjidName,
  inviteLink,
  inviterName = "A member of your community",
  supportEmail = "support@mizan.com",
  token,
}: InvitingUserProps) => {
  return (
    <html>
      <body
        style={{
          background: "#f9f6f4",
          fontFamily: "Arial, Helvetica, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ background: "#f9f6f4", minHeight: "100vh" }}
        >
          <tr>
            <td align="center">
              <table
                width="100%"
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(85,12,24,0.08)",
                  margin: "40px 0",
                  padding: "32px",
                  border: "1px solid #f3e7e7",
                  maxWidth: "600px",
                }}
              >
                <tr>
                  <td align="center" style={{ paddingBottom: "24px" }}>
                    <img
                      src={process.env.DOMAIN + "/mizan.svg"}
                      alt="Mizan Logo"
                      width="80"
                      style={{ display: "block" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h2
                      style={{
                        color: "#550C18",
                        fontWeight: 700,
                        margin: "0 0 16px 0",
                        fontSize: "24px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      You're Invited to {masjidName}!
                    </h2>
                    <p style={{ color: "#222", fontSize: "16px", margin: "0 0 16px 0" }}>
                      Salaam {userName},
                    </p>
                    <p style={{ color: "#222", fontSize: "16px", margin: "0 0 24px 0" }}>
                      {inviterName} has invited you to join <b>{masjidName}</b> on Mizan.
                      Click the button below to accept your invitation and get started!
                    </p>
                    <div style={{ textAlign: "center", margin: "32px 0" }}>
                      <a
                        href={inviteLink}
                        style={{
                          background: "#550C18",
                          color: "#fff",
                          padding: "14px 32px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0.5px",
                          display: "inline-block",
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Accept Invitation
                      </a>
                    </div>
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0" }}>
                      If you have any questions, reply to this email or contact us at{" "}
                      <a href={`mailto:${supportEmail}`} style={{ color: "#550C18" }}>
                        {supportEmail}
                      </a>
                      .
                    </p>
                    <p style={{ color: "#bbb", fontSize: "12px", margin: "32px 0 0 0" }}>
                      If you did not expect this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
              <table width="100%" style={{ marginTop: "16px" }}>
                <tr>
                  <td align="center" style={{ color: "#bbb", fontSize: "12px" }}>
                    &copy; {new Date().getFullYear()} Mizan Management. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

export default InvitingUser;
