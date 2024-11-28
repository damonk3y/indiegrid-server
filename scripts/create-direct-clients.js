import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

export const prisma = new PrismaClient();

const validations = {
  handle: /^[a-zA-ZÀ-ÿ\u00C0-\u017F0-9\-_. ]{3,50}$/, // Alphanumeric with dash/underscore/dot/space, 3-50 chars
  name: /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s\-',.]{2,100}$/, // Letters, spaces, basic punctuation, with Unicode range for accents
  street: /^[a-zA-ZÀ-ÿ\u00C0-\u017F0-9\s\-',.#°ºª\/•()*]{5,100}$/, // Letters (including accents), numbers, spaces, basic punctuation, °, º, ª, •, (), and *
  zip: /^(\d{5}(-\d{4})?|\d{4}-\d{3})$/, // US (5 digits or 5+4) or PT (4+3) format
  phone: /^(?:\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{9})$/, // Various phone formats or 9-digit numbers
  address: /^[a-zA-ZÀ-ÿ\u00C0-\u017F0-9\s\-',.#°ºª\/•()*]{0,150}$/ // Optional, supports international addresses including accents and special characters, and *
};

const validationEntries = Object.entries(validations);

(async () => {
  const fileContent = readFileSync(
    "./scripts/data/direct_clients.csv",
    "utf-8"
  );
  const entries = fileContent.split("\n");
  const records = entries.reduce((acc, entry) => {
    if (entry.includes("#VALOR")) {
      return acc;
    }
    const columns = entry
      .split(";")
      .map(val => (val === "" ? undefined : val));
    const [
      _,
      handle,
      address,
      name,
      street,
      zipAndCity,
      __,
      ___,
      ____,
      _____,
      phone
    ] = columns;
    const [zip, ...cityParts] = zipAndCity
      ? zipAndCity.split(" ")
      : [undefined, undefined];
    const city = cityParts?.join(" ");
    const content = {
      handle: handle?.replace("/n", "").trim(),
      address: address?.trim(),
      name: name?.trim(),
      street: street?.trim(),
      zip: zip?.replace(",", "").trim(),
      city: city?.trim(),
      phone: phone ? phone.replace(/\D/g, "").trim() : undefined
    };
    for (const [field, regex] of validationEntries) {
      if (field === "phone" && !content.phone) continue;
      if (!regex.test(content[field])) {
        return acc;
      }
    }
    acc.push(content);
    return acc;
  }, []);
  for (const record of records) {
    if (!record.name || !record.zip || record.name === record.street)
      continue;
    await prisma.directClient.create({
      data: {
        store_id: "4d83cb25-dc16-467a-83f0-7ba2a18eacdc",
        name: record.name,
        phone: record.phone,
        facebook_url: encodeURI(
          `https://facebook.com/${record.handle}`
        ),
        instagram_url: encodeURI(
          `https://instagram.com/${record.handle}`
        ),
        addresses: {
          create: {
            address_line_1: record.address,
            address_line_2: `${record.street} | ${record.zip} | ${record.city}`,
            city: record.city,
            type: "SHIPPING",
            zip: record.zip,
            isActive: true
          }
        }
      }
    });
  }
})();
