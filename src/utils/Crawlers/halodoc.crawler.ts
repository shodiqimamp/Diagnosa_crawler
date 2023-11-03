import axios from 'axios';
import cheerio from 'cheerio';
const puppeteer = require('puppeteer');
import { DiseaseModel } from '../../models/disease.model';
import { UrlDiseaseModel } from '../../models/urlDisease.model';

export const runWebCrawler = async (url: string) => {
  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const regex = /\n(?! )/g;
      // Scraping data yang Anda butuhkan
      const nama = $('.section-header__content-text-title--xlarge').text().trim().replace("Pengertian ", "");
      const penjelasanHeader = $('h2:contains("Pengertian")');
      const penjelasan = penjelasanHeader.length > 0 ? penjelasanHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const penyebabHeader = $('h2:contains("Penyebab")');
      const penyebab = penyebabHeader.length > 0 ? penyebabHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const gejalaHeader = $('h2:contains("Gejala")');
      const gejala = gejalaHeader.length > 0 ? gejalaHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const faktorResikoHeader = $('h2:contains("Faktor Risiko")');
      const faktorRisiko = faktorResikoHeader.length > 0 ? faktorResikoHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const keDokterHeader = $('h2:contains("Kapan") , p:contains("Kapan")');
      const keDokter = keDokterHeader.length > 0 ? keDokterHeader.nextUntil('h2 , h3, h6', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const diagnosisHeader = $('h2:contains("Diagnosis")');
      const diagnosis = diagnosisHeader.length > 0 ? diagnosisHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const pengobatanHeader = $('h2:contains("Pengobatan")');
      const pengobatan = pengobatanHeader.length > 0 ? pengobatanHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';
      const pencegahanHeader = $('h2:contains("Pencegahan")');
      const pencegahan = pencegahanHeader.length > 0 ? pencegahanHeader.nextUntil('h2 , h3', 'h3, h4, p, ul').text().replace(regex, ', ') : '';

      const deskripsi = `${penjelasan}\n${penyebab}\n${faktorRisiko}\n${gejala}\n${diagnosis}\n${pengobatan}\n${pencegahan}\n${keDokter}`;

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

export const crawlPenyakit = async () => {
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


export const crawlUrlPenyakit = async (url: string) => {
  
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const nama = $('.section-header__content-text-title--xlarge').text().trim().replace("Pengertian ", "");
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