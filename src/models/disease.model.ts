import { model, Document, Schema } from "mongoose";

interface IDisease extends Document{
  name: string;
  description?: string;
}

const DiseaseSchema: Schema = new Schema({
  name: String,
  description: String,
});

export const DiseaseModel = model<IDisease>("Disease", DiseaseSchema);
