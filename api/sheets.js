import { google } from "googleapis";

export default async function handler(req, res) {
  // --- Logging for debugging ---
  console.log("Incoming request method:", req.method);
  console.log("Incoming request body:", req.body);
  console.log("SHEET_ID env variable:", process.env.SHEET_ID);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Authenticate using the service account JSON stored in Vercel
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SHEET_ID;

    // Make sure this matches your tab name exactly
    const range = "Sheet1!A:A"; // or "Sheet 1" if your tab has a space

    // Wrap the incoming values in another array so Google Sheets treats it as a row
    // Expecting req.body.values to be an array, e.g., ["Test Value"]
    const values = [req.body.values];

    console.log("Values to append (nested):", values);

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    console.log("Append result:", result.data);

    res.status(200).json({ success: true, result: result.data });
  } catch (err) {
    console.error("Error appending to sheet:", err);
    res.status(500).json({ error: "Failed to write to sheet", details: err.message });
  }
}