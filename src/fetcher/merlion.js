import fs from "fs";
import {finished} from "stream/promises";
import {fetch, CookieJar} from "node-fetch-cookies";
import {unzipSingleFile} from "./zipUtil";

export async function fetchMerlion(formData, filePath) {
    const cookieJar = new CookieJar();
    const resp = await fetch(cookieJar, "https://b2b.merlion.com/api/login", {
        credentials: "same-origin",
        headers: {
            "Accept": "*/*",
            "Accept-Language": "ru,en-US;q=0.7,en;q=0.3",
            "content-type": "application/json",
            referrer: "https://b2b.merlion.com/",
        },
        body: JSON.stringify(formData),
        method: "POST",
        mode: "cors"
    });
    if (resp.status >= 500) {
        return `Ошибка сервера ${resp.statusText}. Попробуйте позже.`;
    }
    if (resp.status >= 400) {
        return `Неправильный запрос: ${resp.statusText}. Приложение требует обновления.`;
    }
    let respBody = await resp.json();
    if (respBody.error) {
        return respBody.error.message
    }
    const token = respBody.csrf_token

    const prices = await fetch(cookieJar, "https://b2b.merlion.com/api/v1/pricelists", {
        credentials: "include",
        headers: {
            "Accept": "*/*",
            "Accept-Language": "ru,en-US;q=0.7,en;q=0.3",
            "authorization": `Bearer ${token}`,
            referrer: "https://b2b.merlion.com/pricelists/search",
        },
        method: "GET",
        mode: "cors"
    });
    const pricesBody = await prices.json()
    const xlsm = pricesBody.data.data[0]['xlsm']

    const priceResp = await fetch(cookieJar, `https://b2b.merlion.com/api/v1/pricelists/get?lol=${xlsm.lol}&type=xlsm`, {
        credentials: "same-origin",
        headers: {
            "Accept": "*/*",
            "Accept-Language": "ru,en-US;q=0.7,en;q=0.3",
            "authorization": `Bearer ${token}`,
            referrer: "https://b2b.merlion.com/pricelists/search",
        },
        method: "GET",
        mode: "cors"
    });

    console.info(priceResp.status)

    const downloadZipPath = filePath + '.tmp.zip';
    const fileStream = fs.createWriteStream(downloadZipPath);
    const { body } = priceResp;
    await finished(body.pipe(fileStream))
    const unzippedFileName = await unzipSingleFile(downloadZipPath, filePath)
    fs.rmSync(downloadZipPath)
    return {
        message: unzippedFileName,
        fileList: [filePath]
    }
}
