import axios from 'axios';
import cheerio from 'cheerio';
import { DiseaseModel } from '../models/disease.model';
import { UrlDiseaseModel } from '../models/urlDisease.model';

export const runWebCrawler = async (url: string) => {
  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const regex = /\n(?! )/g;
      // Scraping data yang Anda butuhkan
      const nama = $('#wave3 > div > div > div > h1').text().trim();

      const definisHeader = $('h2:contains("Definisi")');
      const definisi = definisHeader.length > 0 ? definisHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const penyebabHeader = $(' h2:contains("Penyebab")');
      const penyebab = penyebabHeader.length > 0 ? penyebabHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const faktorResikoHeader = $('h2:contains("Faktor Risiko")');
      const faktorRisiko = faktorResikoHeader.length > 0 ? faktorResikoHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const gejalaHeader = $('h2:contains("Gejala")');
      const gejala = gejalaHeader.length > 0 ? gejalaHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const keDokterHeader = $('h2:contains("Tata Laksana") , p:contains("Tata Laksana")');
      const keDokter = keDokterHeader.length > 0 ? keDokterHeader.nextUntil('h2 , h3, h6', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const diagnosisHeader = $('h2:contains("Diagnosis")');
      const diagnosis = diagnosisHeader.length > 0 ? diagnosisHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const pengobatanHeader = $('h2:contains("Komplikasi")');
      const pengobatan = pengobatanHeader.length > 0 ? pengobatanHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const pencegahanHeader = $('h2:contains("Pencegahan")');
      const pencegahan = pencegahanHeader.length > 0 ? pencegahanHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const deskripsi = `${definisi}\n${penyebab}\n${faktorRisiko}\n${gejala}\n${diagnosis}\n${pengobatan}\n${pencegahan}\n${keDokter}`;

      const data = {
        name: nama,
        description: deskripsi,
      };

      return data;
    } else {
      throw new Error(`Gagal mengunduh halaman, kode status: ${response.status}`);
    }

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
};

export const crawlDisease = async () => {
    try {
    const urls = await UrlDiseaseModel.find();

    for (const urlDoc of urls) {

      const url = urlDoc.url;

      const data = await runWebCrawler(url);

      // Membuat instance PenyakitModel dengan data yang diambil
      const penyakit = new DiseaseModel({
        name: data.name,
        description: data.description,
      });

      // Menyimpan instance ke database
      await penyakit.save();

      console.log(url);
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
};


export const getAllDisease = async () => {
  const url = 'https://www.ai-care.id/healthpedia/penyakit-a-z';

  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      // Mencari semua elemen <a> dalam elemen dengan class "alpha"
      const penyakitLinks:any[] = [];

       $('body > section.healthpedia > div > div > div.health-content > div:nth-child(25) > ul > li > a').each((index, element) => {
         const linkUrl = $(element).attr('href');
         const name = $(element).text();
          penyakitLinks.push({ nama: name, url: linkUrl });
       });
      
      await UrlDiseaseModel.insertMany(penyakitLinks);
      
      console.log('Semua data penyakit berhasil di-scrape dan disimpan ke dalam database');

    } else {
      console.error(`Gagal mengunduh halaman, kode status: ${response.status}`);
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
};

export const crawlUrlPenyakit = async (url: string) => {
  
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const nama = $('h1.text-lg').text().trim();
    const data = {
      nama: nama,
      url: url,
    }

    UrlDiseaseModel.create(data);

    return data;

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
};