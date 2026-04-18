enum CountryCode {
  MX = "MX",
  US = "US",
  ES = "ES",
}

export interface PhoneNumberFormat {
  number: string;
  internationalNumber: string;
  nationalNumber: string;
  e164Number: string;
  countryCode: CountryCode;
  dialCode: string;
}

type MexicanAreaCode =
  | "33"
  | "55"
  | "56"
  | "81"
  | "22"
  | "44"
  | "66"
  | "87"
  | "61"
  | "89"
  | "99"
  | "83"
  | "77"
  | "74"
  | "73"
  | "47";

const VALID_MEXICAN_AREA_CODES: MexicanAreaCode[] = [
  "33",
  "55",
  "56",
  "81",
  "22",
  "44",
  "66",
  "87",
  "61",
  "89",
  "99",
  "83",
  "77",
  "74",
  "73",
  "47",
];

export function sanitizePhoneNumber(
  phoneNumber: string | null,
): PhoneNumberFormat {
  if (!phoneNumber || phoneNumber === "null") {
    return {
      number: "",
      internationalNumber: "",
      nationalNumber: "",
      e164Number: "",
      countryCode: CountryCode.MX,
      dialCode: "+52",
    };
  }
  if (!phoneNumber?.trim()) {
    throw new Error("El número de teléfono no puede estar vacío");
  }

  // Remover todos los caracteres no numéricos
  let cleanNumber: string = phoneNumber.replace(/\D/g, "");

  // Normalizar el número removiendo códigos de país
  if (cleanNumber.startsWith("52") && cleanNumber.length === 12) {
    cleanNumber = cleanNumber.substring(2);
  } else if (cleanNumber.startsWith("1") && cleanNumber.length === 11) {
    cleanNumber = cleanNumber.substring(1);
  } else if (cleanNumber.startsWith("521") && cleanNumber.length === 13) {
    cleanNumber = cleanNumber.substring(3);
  }

  // Validar longitud
  if (cleanNumber.length !== 10) {
    throw new Error(
      `Número inválido. Se esperaban 10 dígitos, se recibieron: ${cleanNumber.length}`,
    );
  }

  // Validar código de área
  const areaCode: string = cleanNumber.substring(0, 2);
  if (!VALID_MEXICAN_AREA_CODES.includes(areaCode as MexicanAreaCode)) {
    throw new Error(`Código de área ${areaCode} no válido para México`);
  }

  const firstPart: string = cleanNumber.substring(2, 6);
  const secondPart: string = cleanNumber.substring(6, 10);

  return {
    number: cleanNumber,
    internationalNumber: `+52 ${areaCode} ${firstPart} ${secondPart}`,
    nationalNumber: `${areaCode} ${firstPart} ${secondPart}`,
    e164Number: `+52${cleanNumber}`,
    countryCode: CountryCode.MX,
    dialCode: "+52",
  };
}
