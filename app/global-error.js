"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log fatal runtime errors if needed
    console.error("Global runtime error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | TeachLoop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #FAF7F2;
                color: #1C1917;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 1.5rem;
                box-sizing: border-box;
              }
              .error-card {
                background: #FFFFFF;
                border: 1px solid #E7E5E4;
                border-radius: 1rem;
                padding: 2.5rem 2rem;
                max-width: 28rem;
                width: 100%;
                text-align: center;
                box-shadow: 0 4px 12px rgba(28, 25, 23, 0.05);
              }
              .badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                background: #FEF2F2;
                color: #DC2626;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 1rem;
              }
              h1 {
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0 0 0.5rem;
                color: #1C1917;
              }
              p {
                font-size: 0.875rem;
                color: #78716C;
                line-height: 1.5;
                margin: 0 0 1.5rem;
              }
              .btn {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background-color: #C2410C;
                color: #FFFFFF;
                border-radius: 0.5rem;
                text-decoration: none;
                font-size: 0.875rem;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .btn:hover {
                background-color: #9A3412;
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="error-card">
          <span className="badge">Application Error</span>
          <h1>Something went wrong</h1>
          <p>
            An unexpected error occurred while loading TeachLoop. You can try refreshing the page or restarting your session.
          </p>
          <button className="btn" onClick={() => reset()}>
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
