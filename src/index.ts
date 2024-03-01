import express from "express"
import cors from "cors"
import { z } from "zod"
import fs from "fs/promises"

const app = express()

app.use(cors())
app.use(express.json())

const EmailSchema = z.object({
address: z.string()
})

type Email = z.infer<typeof EmailSchema>

const loadEmails = async (filename: string) => {
    try {
      const rawData = await fs.readFile(
        `${__dirname}/../database/${filename}.json`,
        "utf-8"
      );
      const data = JSON.parse(rawData);
      return data as Email[];
    } catch (error) {
      return null;
    }
  };

  const saveEmail = async (filename: string, data: any) => {
    try {
      const fileContent = JSON.stringify(data);
      await fs.writeFile(
        `${__dirname}/../database/${filename}.json`,
        fileContent
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  app.get("/api/emails", async (req, res) => {
    try {
        const result = await loadEmails(`emails`);
        if (result) {
          res.json(result);
        } else {
          res.status(404).json({ error: "Emails data not found" });
        }
      } catch {
        res
          .status(500)
          .json({ error: "An error occured while fetching emails data" });
      }
    });

    app.post("/api/emails", async (req, res) => {
        const result = EmailSchema.safeParse(req.body);
      
        if (!result.success) {
          return res.status(400).json(result.error.issues);
        }
        const emails = await loadEmails(`emails`);
        if (emails === null) {
          res.sendStatus(500);
          return;
        }
        const newEmail = result.data;
        emails.push(newEmail);
      
        await fs.writeFile(
          `${__dirname}/../database/emails.json`,
          JSON.stringify(emails, null, 2)
        );
      
        res.json(`Added to emails!`);
      });

app.listen(3000)