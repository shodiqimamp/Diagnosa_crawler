import { DiseaseModel } from '../models/disease.model';
import { runWebCrawler, crawlDisease, crawlUrlPenyakit, getAllDisease} from '../utils/runWebCrawler'; // Import PenyakitData
exports.addPenyakit = async (req: any, res: any) => {
  try {
    const { url } = req.body;
    const data = await runWebCrawler(url);    // Menunggu hasil scraping
    crawlUrlPenyakit(url);
    const penyakit = new DiseaseModel(data); // Membuat model Penyakit baru dengan data scraping
    await penyakit.save(); // Menyimpan ke database
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

exports.addAllPenyakit = async (req: any, res: any) => {
  try {
    const data = await crawlDisease();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

exports.addAllUrlPenyakit = async (req: any, res: any) => {
  try {
    const data = await getAllDisease();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

exports.getPenyakit = async (req: any, res: any) => {
  try {
    const penyakit = await DiseaseModel.find(); // Menunggu hasil pencarian
    res.status(200).json(penyakit); // Mengirimkan data sebagai respons JSON
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
