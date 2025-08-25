import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEET_ID;

    if (req.method === "POST") {
      // --- Existing POST code to append a row ---
      const range = "Sheet1!A:A"; // adjust tab name if needed
      const values = [req.body.values];
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
      return res.status(200).json({ success: true, result: result.data });

    } else if (req.method === "GET") {
      // --- New GET code to read first 10 rows of column A ---
      const range = "Sheet1!A1:A10"; // first 10 rows of column A
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const values = result.data.values || [];
      // Flatten array: [["val1"], ["val2"], ...] → ["val1","val2",...]
      const flattened = values.map(row => row[0]);
      return res.status(200).json({ values: flattened });
    } else {
      return res.status(405).json({ error: "Only GET and POST allowed" });
    }
  } catch (err) {
    console.error("Sheets error:", err);
    return res.status(500).json({ error: "Failed to access sheet", details: err.message });
  }
}