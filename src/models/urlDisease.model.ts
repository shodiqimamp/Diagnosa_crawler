import { model, Document, Schema } from "mongoose";

interface IUrlDisease extends Document{
  nama: string;
  url: string;
}

const UrlDiseaseSchema: Schema = new Schema({
  nama: String,
  url: String,
});

export const UrlDiseaseModel = model<IUrlDisease>("UrlDisease", UrlDiseaseSchema);
