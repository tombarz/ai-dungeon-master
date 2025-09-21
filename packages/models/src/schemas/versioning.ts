import { z } from "zod";
import { sessionSchema } from "./session";
import { campaignSchema } from "./campaign";
import { characterSchema } from "./character";

// Versioned Schemas

export const versionedSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    version: z.number().int().min(1),
    data: dataSchema,
  });

export const versionedSessionSchema = versionedSchema(sessionSchema);
export const versionedCampaignSchema = versionedSchema(campaignSchema);
export const versionedCharacterSchema = versionedSchema(characterSchema);
