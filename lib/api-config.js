// Configuración de APIs - Archivo seguro
// ⚠️ NO COMPARTIR ESTE ARCHIVO ⚠️

const _0x5a6f = process.env.MEDIAFIRE_API_URL, _0x726f = process.env.MEDIAFIRE_API_KEY;
const _0x6d65 = _0x5a6f || 'https://rest.alyabotpe.xyz/dl/mediafire';
const _0x6b65 = _0x726f || 'Duarte-zz12';

const _0x6662 = _0x5a6f || 'https://rest.alyabotpe.xyz/dl/facebook';
const _0x6b66 = _0x726f || 'Duarte-zz12';

const apisConfig = {
  mediafire: {
    url: _0x6d65,
    key: _0x6b65
  },
  facebook: {
    url: _0x6662,
    key: _0x6b66
  }
};

export default apisConfig;
