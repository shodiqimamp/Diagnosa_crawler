import axios from 'axios';
import cheerio from 'cheerio';
const puppeteer = require('puppeteer');
import { UrlDiseaseModel } from '../../models/urlDisease.model';
import { DiseaseModel } from '../../models/disease.model';

export const runWebCrawler = async (url: string) => {
  try {
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      // Scraping data yang Anda butuhkan
      const nama = $('section-header__content-text-title--xlarge', 'h1, h2').text().trim().replace("Pengertian ", "");
      const deskripsi = $('div.post-content > p > strong').text().trim();
      const regex = /\n(?! )/g;

      const penyebabHeader = $('h3:contains("Penyebab")');
      const penyebab = penyebabHeader.length > 0 ? penyebabHeader.nextUntil('h3', 'h4, p , ul').text().replace(regex, ', ') : '';

      const faktorResikoHeader = $('h3:contains("Faktor risiko")');
      const faktorRisiko = faktorResikoHeader.length > 0 ? faktorResikoHeader.nextUntil('h3, h4', 'h4, p, ul').text().replace(regex, ', ') : '';

      const gejalaHeader = $('h3:contains("Gejala")');
      const gejala = gejalaHeader.length > 0 ? gejalaHeader.nextUntil('h3, h4', 'h4, p, ul').text().replace(regex, ', ') : '';

      const keDokterHeader = $('h4:contains("Kapan") , p:contains("Kapan")');
      const keDokter = keDokterHeader.length > 0 ? keDokterHeader.nextUntil('h3, h4', 'h4, p, ul').text().replace(regex, ', ') : '';

      const diagnosisHeader = $('h3:contains("Diagnosis")');
      const diagnosis = diagnosisHeader.length > 0 ? diagnosisHeader.nextUntil('h3, h4', 'h4, p, ul').text().replace(regex, ', ') : '';

      const pengobatanHeader = $('h3:contains("Pengobatan")');
      const pengobatan = pengobatanHeader.length > 0 ? pengobatanHeader.nextUntil('h3 h4', 'h4, p, ul').text().replace(regex, ', ') : '';

      const pencegahanHeader = $('h3:contains("Pencegahan")');
      const pencegahan = pencegahanHeader.length > 0 ? pencegahanHeader.nextUntil('h3 h4', 'h4, p, ul').text().replace(regex, ', ') : '';


      const data = {
        nama: nama,
        deskripsi: deskripsi,
        penyebab: penyebab,
        faktorRisiko: faktorRisiko,
        gejala: gejala,
        keDokter: keDokter,
        diagnosis: diagnosis,
        pengobatan: pengobatan,
        pencegahan: pencegahan,
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
        nama: data.nama,
        deskripsi: data.deskripsi,
        penyebab: data.penyebab,
        faktorRisiko: data.faktorRisiko,
        gejala: data.gejala,
        keDokter: data.keDokter,
        diagnosis: data.diagnosis,
        pengobatan: data.pengobatan,
        pencegahan: data.pencegahan,
      });

      // Menyimpan instance ke database
      await penyakit.save();
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

    const nama = $('section-header__content-text-title--xlarge', 'h1, h2').text().trim().replace("Pengertian ", "");
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